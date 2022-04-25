jest.mock("../models/post");
jest.mock("../models/hashtag");
const Post = require("../models/post");
const Hashtag = require("../models/hashtag");
const { uploadImage, createPost, deletePost } = require("./post");

describe("uploadImage", () => {
  const req = {
    file: {
      filename: "test filename",
    },
  };
  const res = {
    json: jest.fn(),
  };

  test("res.json { url: `/img/${req.file.filename}` } 반환", () => {
    uploadImage(req, res);
    expect(res.json).toBeCalledWith({
      url: `/img/${req.file.filename}`,
    });
  });
});

describe("createPost", () => {
  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();

  test("hashtag있으면 분류, 추가 후 post 생성, redirect('/')", async () => {
    const req = {
      body: {
        content: "test content #hashtag",
        url: "test url",
      },
      user: {
        id: 0,
      },
    };
    Post.create.mockReturnValue(
      Promise.resolve({
        addHashtags() {
          return Promise.resolve();
        },
      })
    );
    Hashtag.findOrCreate.mockReturnValue(Promise.resolve(["test", 0]));
    await createPost(req, res, next);
    expect(res.redirect).toBeCalledWith("/");
  });

  test("hashtag 없으면 추가 없이 post 생성, redirect('/')", async () => {
    const req = {
      body: {
        content: "test content",
        url: "test url",
      },
      user: {
        id: 0,
      },
    };
    Post.create.mockReturnValue(
      Promise.resolve({
        addHashtags() {
          return Promise.resolve();
        },
      })
    );
    await createPost(req, res, next);
    expect(res.redirect).toBeCalledWith("/");
  });

  test("error시 next(error) 호출", async () => {
    const error = "test error";
    Post.create.mockReturnValue(Promise.reject(error));
    await createPost(req, res, next);
    expect(next).toBeCalledWith(error);
  });
});
