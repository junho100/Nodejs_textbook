const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { verifyToken, apiLimiter } = require("./middlewares");
const { Domain, User, Post, Hashtag } = require("../models/index");

const router = express.Router();

router.use(async (req, res, next) => {
  // url.parse -> new URL 사용 (deprecated)
  const origin = new URL(req.get("origin"));
  const domain = await Domain.findOne({
    // domain의 host와 client secret 모두 일치하는지 확인
    where: { host: origin.host },
  });
  if (domain) {
    cors({
      origin: req.get("origin"), // domain 등록되었으면 cors 허용
      credentials: true,
    })(req, res, next); // if문 분기 등 미들웨어 커스터마이징 시 사용 패턴
  } else {
    next();
  }
});

router.post("/token", apiLimiter, async (req, res) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ["nick", "id"],
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
        expiresIn: "30m",
        issuer: "nodebird",
      }
    );
    return res.json({
      code: 200,
      message: "token was issued",
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

router.get("/test", verifyToken, apiLimiter, (req, res) => {
  res.json(req.decoded);
});

router.get("/posts/my", apiLimiter, verifyToken, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } })
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

router.get(
  "/posts/hashtag/:title",
  verifyToken,
  apiLimiter,
  async (req, res) => {
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
  }
);

router.get("/follow", verifyToken, apiLimiter, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.decoded.id },
    });
    const following = Array(
      await user.getFollowings({
        attributes: ["email"],
      })
    );
    res.status(200).send(following);
  } catch (error) {
    console.error(error);
    return res.status(419).json({
      code: 419,
      message: "server error",
    });
  }
});

module.exports = router;
