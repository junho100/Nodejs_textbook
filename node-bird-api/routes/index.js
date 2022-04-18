const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { User, Domain } = require("../models/index");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: (req.user && req.user.id) || null }, // 로그인 성공 시 req.user 접근가능
      include: { model: Domain },
    });
    res.render("login", {
      user,
      domains: user && user.Domains, // 단축평가 -> 둘다 있으면 오른쪽 할당, 하나라도 false면 false 반환
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/domain", isLoggedIn, async (req, res, next) => {
  try {
    await Domain.create({
      UserId: req.user.id,
      host: req.body.host,
      type: req.body.type,
      clientSecret: uuidv4(),
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
