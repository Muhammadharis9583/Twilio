const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

AWS.config.update({ region: "ap-northeast-1" });
const lambda = new AWS.Lambda();
const params = {
  FunctionName: "Twilio_demo",
  InvocationType: "RequestResponse",
};

// twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;

exports.sendMessage = (req, res) => {
  const userContactNo = "+923045315691";
  console.log(userContactNo);

  client.messages
    .create({
      body: "Hello from Twilio! Kill Yourself",
      from: process.env.MY_PHONE_NUM,
      to: userContactNo,
    })
    .then((message) => res.send(message));
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

exports.listMessages = (req, res, next) => {
  var logs = [];
  client.messages
    .list({ limit: 20 })
    .then((messages) => {
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
      messageDetails;
      console.log(logs);
      res.status(200).render("dashboard-logs", {
        title: "Logs Dashboard",
        logs: logs,
        page_title: "Logs Dashboard",
        folder: "Dashboards",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
