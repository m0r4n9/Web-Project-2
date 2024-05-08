require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const router = require("./src/routes");

const PORT = process.env.PORT || 8080;

const app = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static(path.join(__dirname, "src/public")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: process.env.JWT_SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    }),
);

app.use(router);

const start = () => {
    try {
        app.listen(PORT, () => console.log(`Server start on PORT = ${PORT}`));
    } catch (e) {
        console.log("Error:", e);
    }
};

start();
