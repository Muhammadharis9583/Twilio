const mongoose = require("mongoose");
const validator = require("validator");

const gymSchema = new mongoose.Schema({
  gymAddress: {
    street: { type: String, required: [true, "Please provide a street"] },
    city: { type: String, required: [true, "Please provide a city"] },
    state: { type: String, required: [true, "Please provide a state"] },
    zip: { type: String, required: [true, "Please provide a zip"] },
    country: { type: String, required: [true, "Please provide a country"] },
    postalCode: { type: String, required: [true, "Please provide a postal code"] },
  },
  gymName: {
    type: String,
    required: [true, "Please provide a gym name"],
  },
  gymPhone: {
    type: String,
    required: [true, "Please provide a phone number"],
    // validate the phone number using validator
    validate: {
      validator: function (el) {
        return validator.isMobilePhone(el, "any");
      },
      message: "Please provide a valid phone number",
    },
  },
  gymAdministrator: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Gym", gymSchema);
