const Sequelize = require("sequelize");
const User = require("./user");
const config = require("../config/config")["test"];
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

describe("User model", () => {
  test("static init 메서드 호출", () => {
    expect(User.init(sequelize)).toBe(User);
  }); // init 하면 모델이 반환되는듯하다.

  test("static associate 메서드 호출", () => {
    const db = {
      User: {
        hasMany: jest.fn(),
        belongsToMany: jest.fn(),
      },
      Post: {},
    };
    User.associate(db);
    expect(db.User.hasMany).toBeCalledWith(db.Post);
    expect(db.User.belongsToMany).toBeCalledTimes(3);
  });
});
