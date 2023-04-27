document.getElementById("topbar-logout").addEventListener("click", (event) => {
  event.preventDefault();

  const logout = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "https://localhost:7100/api/v1/users/logout",
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
