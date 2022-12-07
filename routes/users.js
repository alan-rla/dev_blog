const { Op } = require("sequelize");
const { Users } = require("../models");
const express = require('express');
const router = express.Router();
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const { required } = require("joi");

// Joi로 사용자 정보 검증하기
const usersSchema = Joi.object({
    nickname: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,12}$')).required().messages({
        "string.pattern.base": "USERS_NICK_FORM",
    }),
    password: Joi.string().min(4).max(20).required().messages({
        'string.empty': "USERS_PW_INPUT",
        'string.min': "USERS_PW_LIMIT",
        'any.required': "USERS_PW_REQ",
    }),
    confirm: Joi.valid(Joi.ref('password')).required().messages({
        'any.required': "USERS_PW_CONFIRM_REQ",
        "any.only" : "USERS_PW_CONFIRM_UNEQUAL"
    }),
});

router.post("/", async (req, res, next) => {
    try {
        const { nickname, password, confirm } = req.body;
        await usersSchema.validateAsync({nickname, password, confirm})

        // nickname 중복 확인
        const existsUsers = await Users.findAll({
            where: {
                [Op.or]: [{ nickname }],
            },
        });
        if (existsUsers.length) {
            throw {message: "USERS_NICK_REDUNDANT"};
        }         
        // 비밀번호에 닉네임이 포함됐는지 확인
        if (password.includes(nickname)) {
            throw {message: "USERS_NICK_IN_PW"};
        }
        // 비밀번호 암호화
        const hashed = await bcryptjs.hash(password, 12);        
        // DB에 데이터 삽입
        await Users.create({ nickname, password : hashed});
        return res.status(201).send({ message: "회원 가입에 성공했습니다."}); // 201 : 데이터 생성 성공
    } catch (err) {
        if (err.message.includes("USERS_")) {
            next(err);
        } else {
            err.message = "USERS_UNKNOWN";
            next(err);
        }
    }
});

module.exports = router;