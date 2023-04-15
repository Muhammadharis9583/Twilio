const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express()
const AWS = require("aws-sdk");
app.use(cors())
const dotenv = require('dotenv')
dotenv.config()
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

AWS.config.update({ region: "ap-northeast-1" });
const lambda = new AWS.Lambda();
const params = {
  FunctionName: "Twilio_demo",
  InvocationType: "RequestResponse",
};
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
app.get('/message/:num',(req,res)=>{
    const userContactNo = req.params.num
    console.log(userContactNo)
    lambda.invoke(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else {
        const response = JSON.parse(data.Payload);
        console.log(response.body.message);
        client.messages
          .create({
            body: response.body.message,
            from: process.env.MY_PHONE_NUM,
            to: userContactNo,
          })
          .then((message) => res.send(message.sid));
        
      }
    });
})
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);