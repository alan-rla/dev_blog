const express = require('express');
const routes = require("./routes");
const errorHandler = require("./middlewares/error-handler.js")
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config()

const morgan = require('morgan')
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// localhost:3000/api
app.use("/api", routes);
app.use("/", errorHandler);

app.listen(process.env.PORT, () => {
console.log(process.env.PORT, '포트로 서버가 열렸어요!');
});