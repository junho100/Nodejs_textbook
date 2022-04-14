//기본 실행 서버js 파일
const express = require("express");
const cookieParser = require("cookie-parser"); //cookie 쉽게 추출해주는 미들웨어. req.cookie로 접근가능
const morgan = require("morgan");
const path = require("path");
const session = require("express-session"); // 세션을 서버에 저장하고 session id를 cookie를 통해 사용자와 주고받게 함
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport"); // authentication

dotenv.config(); // 환경변수들을 불러오기때문에 최대한 상단에 위치
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");

const { sequelize } = require("./models/index");

const passportConfig = require("./passport/index");

const app = express();
passportConfig(); // passport 설정
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false }) // sequelize 객체 서버 연결
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public"))); // [domain]/public으로 접근 가능 -> 폴더 구조 짐작 못하기 때문에 보안
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // req.body에 요청 정보를 파싱하여 접근 가능하게 한다.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize()); // req 객체에 passport 설정 주입
app.use(passport.session()); // req.session 객체에 passport 정보 저장

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} there is no router`);
  error.status = 404;
  next(error);
}); // 404 미들웨어

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
}); // 최하단 오류 미들웨어 (오류, next(err)시 이 미들웨어로 온다.)

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "port waiting...");
});
