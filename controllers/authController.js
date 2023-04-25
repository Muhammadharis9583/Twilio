const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const mongoose = require("mongoose");

const User = require("../models/userModel");
const Gym = require("../models/gymModel");
const catchAsync = require("../utils/catchAsync");
const HttpError = require("../utils/httpError");
const sendEmail = require("../utils/email");
const { createUserWithToken } = require("../utils/createUserWithToken");
const { saveUserInDB } = require("../utils/dbUser");
const { log } = require("console");

exports.signup = catchAsync(async (req, res, next) => {
  // runs the pre middleware before saving.

  // ADD a transaction here to save the user in the DB. and then add gym details in the DB in gym collection
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const gym = new Gym({
      gymName: req.body.gymName,
      gymAddress: req.body.gymAddress,
      gymPhone: req.body.gymPhone,
    });

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      username: req.body.username,
      contact: req.body.contact,
      address: req.body.address,
      userRole: req.body.userRole,
    });

    // add user id to gym document
    gym.gymAdministrator = newUser._id;
    await gym.save({ session });
    newUser.gyms.push(gym);

    await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    createUserWithToken(newUser, 201, res);
  } catch (error) {
    // rollback changes if any error occurs
    await session.abortTransaction();
    session.endSession();

    return next(new HttpError(error, 500));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // (1) Check if email && password exist.
  if (!email || !password) {
    return next(new HttpError("Please provide email and password!", 400));
  }

  // (2) Check if User exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  /* 
      We have set SELECT=FALSE in the UserModel password field so by default password will not be selected when finding a document. 
      So with +password password will appear again.
     */

  console.log("user", user);
  let isCorrect;
  if (user) {
    if (!user.password) {
      return next(new HttpError("Can't log in. User signed in using third party auth", 400));
    }
    isCorrect = await user.correctPassword(password, user.password);
  }
  /* 
      correctPassword is an INSTANCE FUNCTION created at the userModel. This function will be available at every document.
    */

  if (!user || !isCorrect) {
    return next(new HttpError("Incorrect email or password", 401));
  }

  const loginDate = new Date(Date.now());
  user.lastLogin = loginDate;
  console.log("🚀 ~ file: authController.js:95 ~ exports.login=catchAsync ~ user:", user);

  await user.save({ validateBeforeSave: false });

  // (3) If OK, then send token to client.
  console.log("sending token");
  createUserWithToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie("jwt", "loggingout", {
    expires: new Date(Date.now() + 10 * 1000), // 10sec
    httpOnly: true,
  });

  res.status(200).send({ status: "success" });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new HttpError("No user with this email exist", 404));
  }

  // 2)  Generate random reset token
  const resetToken = user.createPasswordResetToken();
  /* 
      calling save again because we have added 2 new fields i.e. passwordResetToken and passwordResetExpires. So to commit them to the DB we have to save them
     */
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user email
  //const resetUrl = `${req.protocol}://${req.get('host')}/ecomm/users/resetPassword/${resetToken}`;
  const resetUrl = `http://localhost:8000/reset-password/${resetToken}`;
  const message = `Forgot your password! Submit a request with your password and confirmPassword to the url:${resetUrl}. If you didn't forget, then ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token. (valid only for 5 minutes)",
      text: message,
    });
    res.status(200).send({
      status: "success",
      message: "token sent to the email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new HttpError("There was an error sending an email. Please try again!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user baesd on the token
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and user exists. Set the new password
  if (!user) {
    return next(new HttpError("Invalid token or token is expired!", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // 3) update changedPasswordAt property of the user
  /* this was done through the pre save middleware in model */

  // 4) Log in the user, send jwt
  createUserWithToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.user.id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new HttpError("Incorrect Current Password!", 400));
  }

  /* we don't need to check if these both are equal as it is done by mongoose validation defined in the userSchema while saving */
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save({ validateBeforeSave: false });

  // 4) Login the user.
  createUserWithToken(user, 200, res);
});

exports.googleAuth = catchAsync(async function (req, res, next) {
  let existingUser;
  const profile = req.body.user.credential;
  try {
    existingUser = await User.findOne({ email: profile.email });
  } catch (error) {
    return next(new HttpError("Something went wrong. Could not authenticate with google", 500));
  }

  if (!existingUser) {
    // create a new user if there is none signed in before with this google email.
    const newUser = await saveUserInDB(profile);
    console.log(newUser);
    existingUser = newUser;

    createUserWithToken(existingUser, 200, res);

    //
  } else {
    let isAlreadyGoogleUser;

    if (existingUser.providers.length) {
      existingUser.providers.map((providerObj) => {
        // check if user has already signed with google. If yes then the app will not add the google record again in the db.
        if (providerObj.provider === "google") {
          isAlreadyGoogleUser = true;
        }
      });
    }

    // if there is no signed in with google before. So we will add the provider = google and the google userId to this user.
    if (!isAlreadyGoogleUser) {
      existingUser.providers.push({
        provider: "goole",
        id: profile.sub,
      });
      try {
        await existingUser.save({ validateBeforeSave: false });
      } catch (error) {
        return next(
          new HttpError("Something went wrong. Could not authenticate with google.Z", 500)
        );
      }
    }
    createUserWithToken(existingUser, 200, res);
  }
  //res.redirect('http://localhost:8000/dashboard');
});

// -------------------- MIDDLEWARE ----------------- //
/* this function is only for rendered pages. No errors generated */
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      /* 
    promisify will convert the verify function that returns a callback functions into a promise that stores the callback in the decoded
  */
      // 1) Verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET_KEY);

      // (2) Check if user still exists because token is generated by the userId.
      const currentUser = await User.findById(decoded.id);

      // (3) If user is found, then token was correct and not altered.
      if (!currentUser) {
        return next();
      }

      // (4) Check if user changed password after the token was issued. This is done because if the user changed the password, then there will be a new token generated but the older one will exist. So attacker can access the routes with old token
      if (currentUser.changedPassword(decoded.iat)) {
        return next();
      }
      // There is a logged in user. The template (pug) will get the variable named user
      res.locals.user = currentUser;
      req.body.user = currentUser;
      return next();
    }
  } catch (err) {
    return next(); // there is no logged in user. Possibly the user logged out and the token is removed/invalid
  }
  next();
};
exports.protect = catchAsync(async (req, res, next) => {
  // (1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new HttpError("You are not logged in!", 401));
  }

  // (2) Verification of the token.
  /* 
    promisify will convert the verify function that returns a callback functions into a promise that stores the callback in the decoded
  */
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // (3) Check if user still exists because token is generated by the userId.
  const currentUser = await User.findById(decoded.id);
  // if user is found, then token was correct and not altered.
  if (!currentUser) {
    return next(new HttpError("The user belonging to this token no longer exist", 401));
  }

  // (4) Check if user changed password after the token was issued. This is done because if the user changed the password, then there will be a new token geenrated but the older one will exist. So attacker can access the routes with old token
  if (currentUser.changedPassword(decoded.iat)) {
    return next(new HttpError("User recently changed password. Please login again", 401));
  }
  // grant access to the protected route
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  // roles = ['admin','user']
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError("You do not have permission to perform this opertaion!", 403));
    }
    next();
  };
