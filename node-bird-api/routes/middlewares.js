const jwt = require("jsonwebtoken");
const RateLimit = require("express-rate-limit");

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

exports.verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "token was expired",
      });
    }
    return res.status(401).json({
      code: 401,
      message: "invalid token",
    });
  }
};

exports.apiLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "you can request ten times a minute",
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "new version is updated. use new version",
  });
};
