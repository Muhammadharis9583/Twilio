const dotenv = require("dotenv");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");

dotenv.config({ path: "./config.env" });

// AWS.config.update({ region: "ap-northeast-1" });
// const lambda = new AWS.Lambda();
// const params = {
//   FunctionName: "Twilio_demo",
//   InvocationType: "RequestResponse",
// };

// twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;
function unixTimestampToTime(unixTimestamp) {
  // create a new JavaScript Date object based on the unix timestamp
  const date = new Date(unixTimestamp * 1000);

  // hours part from the timestamp
  const hours = date.getHours();

  // minutes part from the timestamp
  const minutes = "0" + date.getMinutes();

  // seconds part from the timestamp
  const seconds = "0" + date.getSeconds();

  // return the time in the format of HH:MM:SS
  return hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
}

exports.createCallerId = (req, res) => {
  client.outgoingCallerIds
    .list({ limit: 20 })
    .then((outgoingCallerIds) => outgoingCallerIds.forEach((o) => console.log(o.sid)));

  client
    .outgoingCallerIds("PNa82bc206b2ff0dba16bbca6a6ae05011")
    .fetch()
    .then((outgoing_caller_id) => console.log({ outgoing_caller_id }));
  // client.validationRequests
  //   .create({ friendlyName: "My Home Phone Number", phoneNumber: "+923045315691" })
  //   .then((validation_request) => console.log(validation_request));
};
exports.sendMessage = (req, res) => {
  // const userContactNo = "+12564792178";
  const userContactNo = req.params.num;
  console.log(userContactNo);
  axios
    .get(`https://ny3.blynk.cloud/external/api/get?token=${process.env.BLYNK_TOKEN}`)
    .then((val) => {
      const message = `There are ${val.data} persons at the Gym`;
      client.messages
        .create({
          body: message,
          from: process.env.MY_PHONE_NUM,
          to: userContactNo,
        })
        .then((message) => res.send(message));
    });
};

exports.receiveMessageReply = (req, res) => {
  // console.log('running')
  const twiml = new MessagingResponse();
  axios
    .get(`https://ny3.blynk.cloud/external/api/get?token=${process.env.BLYNK_TOKEN}`)
    .then((val) => {
      const message = `There are ${val.data} persons at the Gym`;
      twiml.message(message);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    })
    .catch((err) => {
      res.end(err);
    });
};

exports.listMessages = catchAsync(async (req, res, next) => {
  var logs = [];
  client.messages
    .list({ limit: 20 })
    .then(async (messages) => {
      const messageDetails = messages.map((message) => {
        const isoString = message.dateUpdated.toISOString();
        const dateParts = new Date(isoString)
          .toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
          .split(" ");
        // const day = dateParts[0];
        const date = dateParts[2];
        const month = dateParts[1];
        logs.push({
          phoneNumber: message.to,
          date,
          month,
          time: isoString.substring(11, 19),
        });
      });
      req.body.logs = logs; // passing logs to next middleware function
      next();
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "error",
        message: "Something went wrong",
        error,
      });
    });
});
