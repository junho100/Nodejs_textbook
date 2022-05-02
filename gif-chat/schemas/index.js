const mongoose = require("mongoose");

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;

const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@127.0.0.1:27017/admin`;
const connect = () => {
  if (NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }
  mongoose.connect(
    MONGO_URL,
    {
      dbName: "gifchat",
      useNewUrlParser: true, // 새로운 string parser 도입여부 -> 기본적으로 true 한다.
    },
    (error) => {
      if (error) {
        console.log("mongodb connection error", error);
      } else {
        console.log("mongodb connected");
      }
    }
  );
};

mongoose.connection.on("error", (error) => {
  console.error("mongodb connection error", error);
});
mongoose.connection.on("disconnected", () => {
  console.error("mongodb disconnected. trying to reconnect....");
  connect();
});

module.exports = connect;
