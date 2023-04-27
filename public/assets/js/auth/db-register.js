// const axios = require("axios");

//To set the environment automatically
const config = require('./app');


document.querySelector(".form").addEventListener("submit", (event) => {
  event.preventDefault();
  const firstName = document.getElementById("fname").value || "";
  const lastName = document.getElementById("lname").value || "";
  const email = document.getElementById("useremail").value || "";
  const username = document.getElementById("username").value || "";
  const password = document.getElementById("password-input").value || "";
  const passwordConfirm = document.getElementById("userpasswordconf").value || "";
  const contact = document.getElementById("contact").value || "";
  const userStreet = document.getElementById("userStreet").value || "";
  const userCity = document.getElementById("userCity").value || "";
  const userState = document.getElementById("userState").value || "";
  const userZip = document.getElementById("userZip").value || "";
  const userCountry = document.getElementById("userCountry").value || "";
  const userPostal = document.getElementById("userPostal").value || "";
  const userRole = document.getElementById("userRole").value || "";
  const userType = document.querySelector('input[name="user-type"]:checked').value;

  // ------------------------------------------
  const gymName = document.getElementById("gymName").value || "";
  const gymStreet = document.getElementById("gymStreet").value || "";
  const gymCity = document.getElementById("gymCity").value || "";
  const gymState = document.getElementById("gymState").value || "";
  const gymZip = document.getElementById("gymZip").value || "";
  const gymCountry = document.getElementById("gymCountry").value || "";
  const gymPostal = document.getElementById("gymPostal").value || "";
  const gymPhone = document.getElementById("gymPhone").value || "";

  const body = {
    firstName,
    lastName,
    email,
    username,
    password,
    passwordConfirm,
    contact,
    address: {
      street: userStreet,
      city: userCity,
      state: userState,
      zip: userZip,
      country: userCountry,
      postalCode: userPostal,
    },
    userRole,
    userType,
    gymName,
    gymAddress: {
      street: gymStreet,
      city: gymCity,
      state: gymState,
      zip: gymZip,
      country: gymCountry,
      postalCode: gymPostal,
    },
    gymPhone,
  };
  const register = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: `${config.url}/api/v1/users/signup`,
        data: body,
      });
      if (res.data.status === "success") {
        localStorage.setItem("Cuser", firstName + " " + lastName);
        window.setTimeout(() => {
          location.assign("/index");
        }, 500);
      }
    } catch (error) {
      console.log(error);
      document.getElementById("error").innerHTML = error.response.data.message;
    }
  };

  register();
});
