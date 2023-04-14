const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express()
app.use(cors())
const dotenv = require('dotenv')
dotenv.config()
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
app.get('/message/:num',(req,res)=>{
    const userContactNo = req.params.num
    console.log(userContactNo)
    client.messages
      .create({
        body: "MhKing here",
        from: process.env.MY_PHONE_NUM,
        to: userContactNo,
      })
      .then((message) => res.send(message.sid));
})
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);