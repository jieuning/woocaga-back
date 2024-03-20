require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const markerRouter = require("./router/markerRouter");
const registerRouter = require("./router/registerRouter");
const authRouter = require("./router/authRouter");

const port = process.env.PORT;
const uri = process.env.MONGO_CONNECTION;

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

app.use(morgan("dev"));

// 라우터 사용
app.use("/api", markerRouter);
app.use("/api", registerRouter);
app.use("/api", authRouter);

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB 연결 성공");
  })
  .catch((err) => {
    console.log("MongoDB 연결 실패 : ", err);
  });

app.listen(port, () => {
  console.log(`server on port ${port}`);
});

module.exports = app;
