const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const upload = require("express-fileupload");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const route = require("./Routes/route");
const userRoutes = require("./Routes/userRoutes");
const HttpError = require("./utils/httpError");

const app = express();
app.use(cors());
app.disable("etag");
mongoose.set("strictQuery", true);
dotenv.config({ path: "./config.env" });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));
app.use(upload());

app.use(express.json());
app.use(session({ resave: false, saveUninitialized: true, secret: "nodedemo" }));
app.use(cookieParser());

app.set("layout", "layout/layout");
app.use(expressLayouts);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));
// app.use(express.static(__dirname + "/public"));

// app.use('/', authroute);
app.use("/api/v1/users", userRoutes);
app.use("/", route);

app.use((err, req, res, next) => {
  let error = { ...err };
  if (error.name === "JsonWebTokenError") {
    err.message = "please login again";
    err.statusCode = 401;
    return res.status(401).redirect("/login");
  }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "errors";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("connected to the DB");
  })
  .catch((err) => console.log(err));

const http = require("http").createServer(app);
http.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
