const express = require("express");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = null;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followingIdList = [];
  next();
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "my information - Nodebird" });
});

router.get("/join", (req, res) => {
  res.render("join", { title: "signup - Nodebird" });
});

router.get("/", (req, res, next) => {
  const twits = [];
  res.render("main", {
    title: "NodeBird",
    twits,
  });
});

module.exports = router;
