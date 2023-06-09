const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, "Please provide a first name"] },
  lastName: { type: String, required: [true, "Please provide a last name"] },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  contact: {
    type: String,
    required: [true, "Please provide a phone number"],
    // validate the phone number using validator
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el, "any");
      },
      message: "Please provide a valid phone number",
    },
  },
  address: {
    street: { type: String, required: [true, "Please provide a street"] },
    city: { type: String, required: [true, "Please provide a city"] },
    state: { type: String, required: [true, "Please provide a state"] },
    zip: { type: String, required: [true, "Please provide a zip"] },
    country: { type: String, required: [true, "Please provide a country"] },
    postalCode: { type: String, required: [true, "Please provide a postal code"] },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a confirmation password"],
    select: false,
    validate: {
      // this only works on SAVE/CREATE. NOT on the UPDATE functions !!!!
      validator: function (el) {
        // el contains this passwordConfirm field and this.password will contain the password field of the same document being created.
        return el === this.password;
      },
      message: "Passwords don't match",
    },
  },
  gyms: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Gym",
    },
  ],
  userRole: {
    type: String,
    required: [true, "Please provide a user role"],
  },
  userType: {
    type: String,
    enum: ["employee", "customer"],
    default: "customer",
  },
  accountStatus: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  // will only work if password has been modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // this works because requried field is only while passing the data to the function. Not necessary while saving in the Database.
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  // setting the time 1 sec before so that it is ensured that the token is generated before passwordChangedAt updates. This is done as safety as token generation may take some extra time.
  next();
});

// These are the instance method that will be available to any document created.
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // this.password will not work as select=false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimeStamp;
    // changed the password after token generation. so jwt time is less (in milliseconds).
  }

  // false means not changed;
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // 10 minutes = 10*60*1000 => time in milliseconds after generating token

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
