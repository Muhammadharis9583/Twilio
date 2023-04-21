const User = require("../models/userModel");
const Gym = require("../models/gymModel");
const catchAsync = require("../utils/catchAsync");

exports.getGymDetails = catchAsync(async (req, res, next) => {
  const gym = await Gym.findById(req.params.gid).populate("gymAdministrator");
  gym.gymAdministrator.gyms = undefined;
  res.render("gym-details", {
    title: "Gym Details",
    page_title: "Gym Details",
    gym: gym,
    folder: "Dashboard",
    baseUrl: process.env.BASE_URL,
  });
});

exports.listGyms = catchAsync(async (req, res, next) => {
  const userWithGyms = await User.findById(req.body.user._id).populate("gyms");
  const gyms = userWithGyms.gyms;

  res.status(200).render("dashboard-logs", {
    title: "Logs Dashboard",
    logs: req.body.logs,
    gyms: gyms,
    page_title: "Logs Dashboard",
    folder: "Dashboards",
  });
});
