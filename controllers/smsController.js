const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

dotenv.config({ path: "./config.env" });

// AWS.config.update({ region: "ap-northeast-1" });
// const lambda = new AWS.Lambda();
// const params = {
//   FunctionName: "Twilio_demo",
//   InvocationType: "RequestResponse",
// };
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});
const params = {
  FunctionName: "Demo",
  InvocationType: "RequestResponse",
};

const lambda = new AWS.Lambda();

// twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;

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
  lambda.invoke(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      const response = JSON.parse(data.Payload);
      client.messages
        .create({
          body: response.body.message,
          from: process.env.MY_PHONE_NUM,
          to: userContactNo,
        })
        .then((message) => res.send(message));
    }
  });
};

exports.receiveMessageReply = (req, res) => {
  // console.log('running')
  const twiml = new MessagingResponse();
  lambda.invoke(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      const response = JSON.parse(data.Payload);
      console.log(response.body.message);
      twiml.message(response.body.message);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    }
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
