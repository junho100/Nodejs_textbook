jest.mock("../models/user");
const User = require("../models/user");
const { addFollowing } = require("./user");

describe("addFollowing", () => {
  const next = jest.fn();
  const req = {
    user: {
      id: 1,
    },
    params: {
      id: 2,
    },
  };
  const res = {
    send: jest.fn(),
    status: jest.fn(() => res),
  };
  test("사용자 찾아 팔로잉 추가하고 success응답", async () => {
    User.findOne.mockReturnValue(
      Promise.resolve({
        addFollowing(id) {
          return Promise.resolve();
        },
      })
    );
    await addFollowing(req, res, next);
    expect(res.send).toBeCalledWith("success");
  });

  test("사용자 못찾으면 res.status(404).send(no user) 호출", async () => {
    User.findOne.mockReturnValue(null);
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith("no user");
  });

  test("db 에러 발생하면 next(error)호출", async () => {
    const error = "error for test";
    User.findOne.mockReturnValue(Promise.reject(error));
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(error);
  });
});
