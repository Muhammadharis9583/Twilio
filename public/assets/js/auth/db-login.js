document.querySelector(".form").addEventListener("submit", (event) => {
  event.preventDefault();
  var email = document.getElementById("username").value || "";
  var password = document.getElementById("userpassword").value || "";
  const login = async () => {
    console.log(email, password);
    try {
      const res = await axios({
        method: "POST",
        url: `https://localhost:7100/api/v1/users/login`,
        data: {
          email,
          password,
        },
      });
      if (res.data.status === "success") {
        console.log("success");
        localStorage.setItem("Cuser", email);
        window.setTimeout(() => {
          // eslint-disable-next-line no-restricted-globals
          location.assign("/index");
        }, 500);
      }
    } catch (error) {
      console.log(error);
      document.getElementById("error").innerHTML = "*Invalid Email or Password!!!";
    }
  };

  login();
});
