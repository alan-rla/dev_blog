const { Users } = require("../models");
const express = require('express');
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken")

// 로그인 기능
router.post("/", async (req, res, next) => {
    try {
        const { nickname, password } = req.body;
  
        const user = await Users.findOne({
            where: {
                nickname,
            },
        });
        const comparePW = await bcryptjs.compare(password, user.password);

        if (!user || !comparePW) {
            throw {message: "LOGIN_FAIL"}
        }
        const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {expiresIn: '2h'});
        return res.status(200).cookie("token", token).send(token);
    } catch (err) {
        if (err.message.includes("LOGIN_")) {
            next(err);
        } else {
            err.message = "LOGIN_UNKNOWN";
            next(err);
        }
    }
});

module.exports = router;