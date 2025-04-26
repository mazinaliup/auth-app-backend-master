const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const mongoConnect = require("./conf/mongoConnection");
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
mongoConnect();

const userRoutes = require("./routes/user");
const refreshRoute = require("./routes/refresh");

app.use("/user", userRoutes);
app.use("/token", refreshRoute);

app.listen(3005, () => console.log("app listening"));
