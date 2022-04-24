//passport.authenticate가 호출하면 로컬 로그인 전략 수행
//로그인 유효한지 체크하고, 콜백함수를 실행하여 passport.authenticate 계속해서 실행함.
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        // done 파라미터는 authenticate에 콜백함수
        try {
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "invalid password" });
            }
          } else {
            done(null, false, { message: "no user" });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
