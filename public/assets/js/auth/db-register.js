// const axios = require("axios");

document.querySelector(".form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value || "";
  const email = document.getElementById("useremail").value || "";
  const password = document.getElementById("password-input").value || "";
  const passwordConfirm = document.getElementById("userpasswordconf").value || "";
  const gymName = document.getElementById("gymName").value || "";
  const gymAddress = document.getElementById("gymAddress").value || "";
  const gymPhone = document.getElementById("gymPhone").value || "";

  const register = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: "http://localhost:7100/api/v1/users/signup",
        data: {
          name,
          email,
          password,
          passwordConfirm,
          gymName,
          gymAddress,
          gymPhone,
        },
      });
      if (res.data.status === "success") {
        localStorage.setItem("Cuser", name);
        window.setTimeout(() => {
          // eslint-disable-next-line no-restricted-globals
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
