const Sequelize = require("sequelize");

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.STRING(140),
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200), // 이미지 경로를 저장
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Post",
        tableName: "posts",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Post.belongsTo(db.User); // post.addUser와 같은 메소드 사용 가능
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" }); // N:M 관계, foreignKey 지정 안했기때문에 postId, hashtagId 자동 생성
  }
};
