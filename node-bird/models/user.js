const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false, // createdAt VS created_at
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8", //한글입력 위함
        collate: "utf8_general_ci", //한글입력 위함
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post); // 1:N -> user.getPosts, user.addPosts등의 메서드 생성
    // Following, Follower 구현을 위해 새로운 Follow 테이블 생성(자동)
    db.User.belongsToMany(db.User, {
      foreignKey: "followingId",
      as: "Followers", // A의 following 찾으려면 어떤 사람의 follower가 A인지 알아야함, user.getFollowers와같은 메소드 사용 가능
      through: "Follow",
    });
    db.User.belongsToMany(db.User, {
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });
    db.User.belongsToMany(db.Post, {
      through: "Like",
    });
  }
};
