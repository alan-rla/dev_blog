const jwt = require("jsonwebtoken")
const { Users } = require("../models");
require('dotenv').config();

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    const [authType, authToken] = (authorization || "").split(" ");
    
    // authType: Bearer
    // authToken : 실재 jwt 토큰 값

    // authType이 Bearer가 아니거나 authToken이 없을 때
    if (authType !== "Bearer" || !authToken) {
        res.status(400).json({
            errorMessage : "로그인 후 사용이 가능한 API 입니다"
        })
        return;
    }
    
    try {
        // authToken 복호화 및 검증
        const {userId} = jwt.verify(authToken, process.env.SECRET_KEY);
        Users.findByPk(userId).then((user) => {
            res.locals.user = user; // DB에서 매번 사용자 정보를 가져오지 않도록 express가 제공하는 안전한 변수(res.locals.user)에 저장
            next();
        });
    } catch (error) {
        res.status(400).json({
            errorMessage : "로그인 후 사용이 가능한 API 입니다"
        })
        return;
    } 
    return;    
};