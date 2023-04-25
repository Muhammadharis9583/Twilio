const form = document.querySelector(".form");
const passwordForm = document.querySelector("#passwordForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("updating");
    const firstName = document.querySelector("#firstnameInput").value;
    const lastName = document.querySelector("#lastnameInput").value;
    const email = document.querySelector("#emailInput").value;
    const phone = document.querySelector("#phonenumberInput").value;
    const joiningDate = document.querySelector("#JoiningdateInput").value;

    const designation = document.querySelector("#designationInput").value;

    const city = document.querySelector("#cityInput").value;
    const country = document.querySelector("#countryInput").value;

    const zipCode = document.querySelector("#zipcodeInput").value;

    const data = {
      firstName,
      lastName,
      email,
      phone,
      joiningDate,
      designation,
      city,
      country,
      zipCode,
    };

    const update = async () => {
      try {
        const res = await axios({
          method: "PATCH",
          url: "http://sweatsignal.herokuapp.com/api/v1/users/updateMyInfo",
          data,
        });
        if (res.data.status === "success") {
          console.log(res.data);
          localStorage.setItem(
            "Cuser",
            res.data.data.user.firstName + " " + res.data.data.user.lastName
          );
          window.setTimeout(() => {
            location.assign("/pages-profile");
          }, 500);
        }
      } catch (error) {
        console.log(error);
        document.getElementById("error").innerHTML = error.response.data.message;
      }
    };
    update();
  });
}

if (passwordForm) {
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("updaing password");
    const currentPassword = document.getElementById("oldpasswordInput").value;
    const password = document.getElementById("newpasswordInput").value;
    const passwordConfirm = document.getElementById("confirmpasswordInput").value;

    try {
      const res = await axios({
        method: "PATCH",
        url: "http://sweatsignal.herokuapp.com/api/v1/users/updatePassword",
        data: {
          currentPassword,
          password,
          passwordConfirm,
        },
      });

      if (res.data.status === "success") {
        console.log(res.data);
        window.setTimeout(() => {
          location.assign("/pages-profile");
        }, 500);
      }
    } catch (error) {
      console.log(error);
      document.getElementById("error").innerHTML = error.response.data.message;
    }
  });
}
