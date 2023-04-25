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
      console.log(response.body.timestamp + response.body.count);
      const message = `There are ${
        response.body.count
      } persons at the Gym at ${unixTimestampToTime(response.body.timestamp)}`;
      twiml.message(response.body.message);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    }
  });
};
