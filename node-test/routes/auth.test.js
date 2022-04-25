const request = require("supertest");
const { sequelize } = require("../models/index");
const app = require("../app");

beforeAll(async () => {
  await sequelize.sync();
});

describe("POST /join", () => {
  // 로그인 안했을때
  test("로그인 안 했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "zerohch0@gmail.com",
        nick: "zerocho",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done); // 302인 이유 -> redirect는 status code 302를 반환한다.
  });
});

describe("POST /join", () => {
  // 로그인 했을 때 -> 로그인 안했을 때와 구분하기 위해 분리
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

  test("이미 로그인했으면 redirect /", (done) => {
    const message = encodeURIComponent("exist");
    agent
      .post("/auth/join")
      .send({
        email: "zerohch0@gmail.com",
        nick: "zerocho",
        password: "nodejsbook",
      })
      .expect("Location", `/join?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  test("가입되지 않은 회원", (done) => {
    const message = encodeURIComponent("no user");
    request(app)
      .post("/auth/login")
      .send({
        email: "zeroch1@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .expect("Location", "/")
      .expect(302, done);
  });

  test("비밀번호 틀림", (done) => {
    const message = encodeURIComponent("invalid password");
    request(app)
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "wrong",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인되어 있지 않으면 403", (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "zerohch0@gmail.com",
        password: "nodejsbook",
      })
      .end(done);
  });

  test("로그아웃 수행", (done) => {
    agent.get("/auth/logout").expect("Location", `/`).expect(302, done);
  });
});

afterAll(async () => {
  await sequelize.sync({ force: true });
});
