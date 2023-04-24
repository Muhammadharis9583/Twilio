// const axios = require("axios");
// const { showAlert } = require("../alerts.js");

document.querySelector(".form").addEventListener("submit", (event) => {
  event.preventDefault();
  var email = document.getElementById("username").value || "";
  var password = document.getElementById("userpassword").value || "";
  const login = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: `https://sweatsignal.herokuapp.com/api/v1/users/login`,
        data: {
          email,
          password,
        },
      });
      if (res.data.status === "success") {
        localStorage.setItem("Cuser", email);
        window.setTimeout(() => {
          // eslint-disable-next-line no-restricted-globals
          location.assign("/index");
        }, 500);
      }
    } catch (error) {
      document.getElementById("error").innerHTML = "*Invalid Email or Password!!!";
    }
  };

  login();
});
