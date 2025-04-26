const mongoose = require("mongoose");

const mongoConnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URI);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("mongo db connected");
    });

    connection.on("error", (err) => {
      console.log("connection error", err.message);
    });
  } catch (err) {
    console.log("err", err.message);
  }
};

module.exports = mongoConnect;
