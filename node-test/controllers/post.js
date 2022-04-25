exports.uploadImage = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
};

exports.createPost = async (req, res, next) => {
  // multipart data req.body에 있으면 무조건 multer 거쳐야함
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  const twitId = parseInt(req.params.id, 10);
  try {
    await Post.destroy({
      where: {
        id: twitId,
      },
    });
    res.send("success");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
