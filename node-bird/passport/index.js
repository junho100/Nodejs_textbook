//local, kakao 로그인 strategy 실행
/*
1. 라우터 로그인 요청
2. passport.authenticate 호출
3. 로그인 strategy 수행
4. 로그인 성공 시 사용자 정보 객체와 함께 req.login 호출
5. passport.seriaizeUser 호출
6. req.session에 userId 저장
7. 로그인 완료
*/
/*
1. 요청
2. passport.deserializeUser 호출
3. req.session에 userId로 db에서 사용자 조회
4. 사용자 정보 req.user에 저장
5. 라우터에서 사용자 정보 사용
*/
const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");
const Post = require("../models/post");

module.exports = () => {
  passport.serializeUser((user, done) => {
    // 로그인시 실행. req.session 객체에 어떤 데이터 저장할지 정함.
    done(null, user.id); // 첫번째 파라미터 : 에러, 두번째 : 저장할 데이터
  });

  passport.deserializeUser((id, done) => {
    // 매 요청시 실행. user.id가 첫번째 파라미터.
    User.findOne({
      // req에 사용자 정보 저장
      where: { id },
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
        {
          model: Post,
          attributes: ["id"],
          as: "Posts",
        },
      ],
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
