const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "backend/config/config.env" });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

app.use("/api/v1", postRoutes);
app.use("/api/v1", userRoutes);

module.exports = app;
