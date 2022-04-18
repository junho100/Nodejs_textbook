const express = require("express");
const jwt = require("jsonwebtoken");

const { verifyToken, deprecated } = require("./middlewares");
const { Domain, User, Post, Hashtag } = require("../models/index");

const router = express.Router();

router.use(deprecated); // 버전 업으로 인한 경고 미들웨어

router.post("/token", async (req, res) => {
  // 도메인 check -> 토큰발행
  // 토큰발급 라우터
  const { clientSecret } = req.body; // 보안이슈
  try {
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attributes: ["nick", "id"],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: "No domain. register domain",
      });
    }
    const token = jwt.sign(
      {
        id: domain.User.id,
        nick: domain.User.nick,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m",
        issuer: "nodebird",
      }
    );
    return res.json({
      code: 200,
      message: "token is issued",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "server error",
    });
  }
});

router.get("/test", verifyToken, (req, res) => {
  // 토큰 유효성 검사 후 유효하면 req.decoded 보내는 테스트 미들웨어
  res.json(req.decoded);
});

router.get("/posts/my", verifyToken, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } }) // token 속 payload 정보로 post 검색
    .then((posts) => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: "server error",
      });
    });
});

router.get("/posts/hashtag/:title", verifyToken, async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({
      where: { title: req.params.title },
    });
    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: "no result",
      });
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "server error",
    });
  }
});

module.exports = router;
