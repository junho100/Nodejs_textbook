const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server }); // web socket server 생성

  wss.on("connection", (ws, req) => {
    // 연결 시
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // client ip
    console.log("new client connected", ip);
    ws.on("message", (message) => {
      // client에서 message 수신 시
      console.log(message.toString());
    });
    ws.on("error", (error) => {
      console.error(error); // client - server 통신 중 에러
    });
    ws.on("close", () => {
      // client 접속 해제 시
      console.log("client disconnected", ip);
      clearInterval(ws.interval);
    });
    ws.interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        // web socket server 상태 확인 (CONNECTING, OPEN, CLOSING, CLOSED)
        ws.send("server send message to client");
      }
    }, 3000);
  });
};
