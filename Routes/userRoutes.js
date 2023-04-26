const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  logout,
  protect,
  isLoggedIn,
  updatePassword,
} = require("../controllers/authController");
const {
  receiveMessageReply,
  sendMessage,
  createCallerId,
} = require("../controllers/smsController");
const { getMe, getUserById, updateMe } = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.get("/me", isLoggedIn, getMe, getUserById);
router.patch("/updateMyInfo", isLoggedIn, updateMe);
router.patch("/updatePassword", isLoggedIn, updatePassword);
router.post("/sms", receiveMessageReply);
router.get("/message/:num", sendMessage);
router.get("/createCallerId", createCallerId);
module.exports = router;
