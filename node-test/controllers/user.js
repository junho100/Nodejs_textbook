const User = require("../models/user");

exports.addFollowing = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // req.user가 :id 사람을 팔로잉 한다.
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
