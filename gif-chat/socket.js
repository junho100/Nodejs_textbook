const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("new client connected", ip);
    ws.on("message", (message) => {
      console.log(message);
    });
    ws.on("error", (error) => {
      console.error(error);
    });
    ws.on("close", () => {
      console.log("client disconnected", ip);
      clearInterval(ws.interval);
    });
  });

  ws.interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send("server send message to client");
    }
  }, 3000);
};
