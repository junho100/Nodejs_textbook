const jwt = require("jsonwebtoken"); /* auth token은 http header에 authorization에 저장되에 보낸다. 
body 아닌 header에 보내는 이유는 body의 유무와 상관없이 authorization을 확인하기 위해서다.*/
// get등과같은 요청은 body가 없을 수 있다.
// jwt 로그인 ->  세션쿠키 대신 jwt토큰을 쿠키로 보내 로그인을 한다.
const RateLimit = require("express-rate-limit"); // 요청제한 미들웨어

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
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET); // headers 에 authorization에 저장된 토큰 유효성 검사. 성공 시 req.decoded에 저장
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

exports.freeApiLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: 1,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "you can request once a minute",
    });
  },
});

exports.preApiLimiter = RateLimit({
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
