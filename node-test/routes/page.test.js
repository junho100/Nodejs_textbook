const request = require("supertest");
const { sequelize } = require("../models/index");
const app = require("../app");

beforeAll(async () => {
  await sequelize.sync();
  request(app).post("/auth/join").send({
    email: "zerohch0@gmail.com",
    nick: "zerocho",
    password: "nodejsbook",
  });
});

describe("login POST /", () => {
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        passwrod: "nodejsbook",
      })
      .end(done);
  });
  test("로그인 되어있으면 포스트 생성", (done) => {
    agent
      .post("/post")
      .send({
        content: "test content",
        img: "test url",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});

// describe("no login POST /", () => {
//   test("로그인 안되어있으면 403.Login required", (done) => {});
// });

// describe("DELETE /:id", () => {});
