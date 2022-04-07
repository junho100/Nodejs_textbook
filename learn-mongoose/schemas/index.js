const mongoose = require("mongoose");

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }
  mongoose.connect(
    "mongodb://root:Dnwjdals306!@localhost:27017/admin",
    {
      dbName: "nodejs",
      useNewUrlParser: true,
      useCreateIndex: true,
    },
    (error) => {
      if (error) {
        console.log("connection error", error);
      } else {
        console.log("connection success");
      }
    }
  );
};

mongoose.connection.on("error", (error) => {
  console.error("connection error", error);
});

mongoose.connection.on("disconnected", () => {
  console.error("disconnected. trying to connect...");
  connect();
});

module.exports = connect;
