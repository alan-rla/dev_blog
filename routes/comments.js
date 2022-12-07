const { DataTypes, Sequelize } = require("sequelize");
const { Users, Posts, Comments } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware.js")
const express = require('express');
const router = express.Router();

// 댓글 생성
router.post("/:postId", authMiddleware, async (req, res, next) => {    
    try {        
        const { userId, nickname } = res.locals.user;
        const { postId } = req.params;
        const { comment } = req.body;
        const post = await Posts.findByPk(postId);
        // 게시글 존재하는지 확인
        if (!post) {
            throw {message: "POSTS_GET_UNKNOWN"};
        }
        // 댓글 내용 있는지 확인        
        if (comment.length === 0) {
            throw {message: "COMMENTS_COMMENT_NULL"}
        }
        await Comments.create({ postId, userId, nickname, comment })
        return res.json({ message : "댓글을 생성했습니다." });
    } catch (err) {
        if (err.message.includes("POSTS_") || err.message.includes("COMMENTS_")) {
            next(err);
        } else {
            err.message = "COMMENTS_POST_UNKNOWN";
            next(err);
        }
    }
});

// 댓글 조회
router.get("/:postId", async (req, res, next) => {
    try {        
        const { postId } = req.params;
        const post = await Posts.findByPk(postId);
        // 게시글 존재하는지 확인
        if (!post) {
            throw {message: "POSTS_GET_UNKNOWN"};
        }

        const comments = await Comments.findAll({
            where: {'postId':postId},
            order: [[ 'commentId', 'DESC']],
            attributes: ['commentId', 'userId', [Sequelize.col("User.nickname"), 'nickname'], 'comment', 'createdAt', 'updatedAt'],
            include: [{model: Users, attributes: []}],
        });

        return res.status(200).json({"data": comments});
    } catch (err) {
        if (err.message.includes("POSTS_") || err.message.includes("COMMENTS_")) {
            next(err);
        } else {
            err.message = "COMMENTS_GET_UNKNOWN";
            next(err);
        }
    }
});

// 댓글 수정
router.put("/:commentId", authMiddleware, async (req, res, next) => {              
    try {
        const { userId } = res.locals.user;
        const { commentId } = req.params;
        const { comment } = req.body;        
        const commentOrigin = await Comments.findByPk(commentId);
        // 댓글 존재하는지 확인
        if (!commentOrigin) {
            throw {message: "COMMENTS_GET_UNKNOWN"};
        }
        // 로그인한 계정이 댓글 작성자인지 확인
        if (commentOrigin.userId !== userId) {
            throw {message: "COMMENTS_ID_UNMATCH"};
        }
        // 댓글 내용 있는지 확인
        if (comment.length === 0) {
           throw {message: "COMMENTS_COMMENT_NULL"}
        }
        commentOrigin.comment = comment;
        commentOrigin.updatedAt = DataTypes.NOW;
        await commentOrigin.save();
        return res.status(200).json({ message: "댓글을 수정했습니다." });
    } catch (err) {
        if (err.message.includes("COMMENTS_")) {
            next(err);
        } else {
            err.message = "COMMENTS_PUT_UNKNOWN";
            next(err);
        }
    }
});

// 댓글 삭제
router.delete("/:commentId", authMiddleware, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { commentId } = req.params;
        const comment = await Comments.findByPk(commentId);
        // 댓글 존재하는지 확인
        if (!comment) {
            throw {message: "COMMENTS_GET_UNKNOWN"};
        }
        // 로그인한 계정이 댓글 작성자인지 확인
        if (comment.userId !== userId) {
            throw {message: "COMMENTS_ID_UNMATCH"};
        }
        await comment.destroy();
        return res.status(200).json({ message: '댓글을 삭제했습니다.' });
    } catch (err) {
        if (err.message.includes("COMMENTS_")) {
            next(err);
        } else {
            err.message = "COMMENTS_DELETE_UNKNOWN";
            next(err);
        }
    }
});

module.exports = router;