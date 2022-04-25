const express = require("express");
const multer = require("multer"); // 파일 업로드 구현
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, User } = require("../models/index");
const { isLoggedIn } = require("./middlewares");
const { uploadImage, createPost, deleteImage } = require("../controllers/post");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.error("no uploads folder. making folder...");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/"); // 저장위치
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일이름 지정
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/img", isLoggedIn, upload.single("img"), uploadImage);

const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), createPost);

router.delete("/:id", deleteImage);

router.patch("/:id/like", isLoggedIn, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findOne({ where: { id: postId } });
    const userId = parseInt(req.user.id, 10);
    const user = await User.findOne({ where: { id: userId } });
    await post.addUsers(user);
    await Post.update({ likes: post.likes + 1 }, { where: { id: postId } });
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:id/unlike", isLoggedIn, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findOne({ where: { id: postId } });
    const userId = parseInt(req.user.id, 10);
    const user = await User.findOne({ where: { id: userId } });
    await post.removeUsers(user);
    await Post.update({ likes: post.likes - 1 }, { where: { id: postId } });
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
