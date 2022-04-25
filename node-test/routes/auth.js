const express = require("express");
const passport = require("passport");

const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { join, login, logout } = require("../controllers/auth");

const router = express.Router();
//회원가입
router.post("/join", isNotLoggedIn, join);
//로그인
router.post("/login", isNotLoggedIn, login);
//로그아웃
router.get("/logout", isLoggedIn, logout);

router.get("/kakao", passport.authenticate("kakao")); // kakao 로그인 화면으로 로그인 전략 수행

router.get(
  // kakao에서 로그인 결과 받고 다시 passport.authenticate 호출
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);
// kakao 로그인은 내부적으로 로그인 성공 시 req.login 호출 -> 콜백함수 직접 호출할 필요 없음
module.exports = router;
