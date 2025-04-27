const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
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
mongoConnect();

const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

const refreshRoute = require("./routes/refresh");
app.use("/token", refreshRoute);

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/review", reviewRoutes);



app.listen(3005, () => console.log("app listening"));
