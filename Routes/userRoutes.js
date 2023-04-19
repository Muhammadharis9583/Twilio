const express = require("express");
const router = express.Router();

const { login, signup, logout } = require("../controllers/authController");
const { receiveMessageReply, sendMessage } = require("../controllers/smsController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.post("/sms", receiveMessageReply);
router.get("/message", sendMessage);
module.exports = router;
