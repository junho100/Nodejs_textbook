const SocketIO = require("socket.io"); // npm i socket.io@2 -> 2버전 설치
const axios = require("axios");

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: "/socket.io" }); // 클라이언트가 접속할 경로 path에 추가 -> 클라이언트도 path에 동일한 경로 넣어야함
  app.set("io", io);
  const room = io.of("/room");
  const chat = io.of("/chat");

  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  room.on("connection", (socket) => {
    console.log("room namespace connected");
    socket.on("disconnect", () => {
      console.log("room namespace disconnected");
    });
  });

  chat.on("connection", (socket) => {
    console.log("chat namespace connected");
    const req = socket.request;
    const {
      headers: { referer },
    } = req;
    const roomId = referer
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, "");
    socket.join(roomId);
    socket.to(roomId).emit("join", {
      user: "system",
      chat: `${req.session.color} joined`,
    });

    socket.on("disconnect", () => {
      console.log("chat namespace disconnected");
      socket.leave(roomId);
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;
      if (userCount === 0) {
        axios
          .delete(`http://localhost:8005/room/${roomId}`)
          .then(() => {
            console.log("delete room request success");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        socket.to(roomId).emit("exit", {
          user: "system",
          chat: `${req.session.color} exit`,
        });
      }
    });
  });
};
