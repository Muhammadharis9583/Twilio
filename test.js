const accountSid = "AC836e8f7e4bcb2ad1b53b2413f6d1fdb5";
const authToken = "78a641dfdb12089a95317d9da8d1407e";
const client = require("twilio")(accountSid, authToken);

client.messages
  .list({ limit: 20 })
  .then((messages) => {
    const messageDetails = messages.map((message) => {
      const phoneNumber = message.to;
       const isoString = message.dateUpdated.toISOString();
       const date = isoString.substring(0, 10);
       const time = isoString.substring(11, 19);
      return { phoneNumber, date, time };
    });
    console.log(messageDetails);
  })
  .catch((error) => {
    console.log(error);
  });