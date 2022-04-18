const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const morgan = require("morgan");
const session = require("express-session"); // req.session 통해 session id 주고받을 수 있음
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const v1 = require("./routes/v1");
const v2 = require("./routes/v2");

const { sequelize } = require("./models/index");

const passportConfig = require("./passport/index");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 8002);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
sequelize // sync는 현재 모델과 db를 동기화 한다.
  .sync({ force: false }) //  force : 존재한다면 drop 후 생성, alter : 현재 model에 맞게 수정
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); //cookie는 client에 저장되는 정보. cookie-parser 통해 req.cookies 속성으로 서버에서 접근할 수 있다.
app.use(
  session({
    // session은 server에 정보가 저장된다. cookie 를 통해 사용자 id를 받고 서버의 session에서 full 정보를 받는 구조
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/", indexRouter);
app.use("/v1", v1);
app.use("/v2", v2);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} No Router`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "port waiting....");
});
