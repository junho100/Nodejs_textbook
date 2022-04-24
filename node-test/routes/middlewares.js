//로그인 여부 미들웨어.
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    //로그인 했으면 true, 아니면 false
    next();
  } else {
    res.status(403).send("Login required");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("already logged in");
    res.redirect(`/?error=${message}`);
  }
};
