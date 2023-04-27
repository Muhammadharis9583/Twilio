//To set the environment automatically
const config = require('./app');

document.getElementById("topbar-logout").addEventListener("click", (event) => {
  event.preventDefault();

  const logout = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: `${config.url}/api/v1/users/logout`,
      });0
      if (res.data.status === "success") {
        localStorage.removeItem("Cuser");
        location.assign("/login");
        // true will make the server reload the page and not the browser
      }
    } catch (error) {
      console.log(error.response);
      //   showAlert("error", "Error logging out. Please try again");
    }
  };

  logout();
});
