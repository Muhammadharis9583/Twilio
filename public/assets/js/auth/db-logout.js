import { environment } from "../config.js";

document.getElementById("topbar-logout").addEventListener("click", (event) => {
  event.preventDefault();
  const logout = async () => {
    const url =
      environment === "development" ? "http://localhost:7100" : "https://sweatsignal.herokuapp.com";
    try {
      const res = await axios({
        method: "GET",
        url: `${url}/api/v1/users/logout`,
      });
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
