const { Op, DataTypes, Sequelize } = require("sequelize");
const { Users, Posts, Comments, Likes } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware.js")
const express = require('express');
const router = express.Router();

// 게시글 POST
router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { title, content } = req.body;
        // 제목/내용 있는지 확인
        if (title.length === 0 || content.length === 0) {
            throw {message: "POSTS_TITLE_CONTENT_NULL"}
        }                

        await Posts.create({ userId, title, content });

        return res.json({ message : "게시글을 작성했습니다." });
    } catch (err) {
        if (err.message.includes("POSTS_")) {
            next(err);
        } else {
            err.message = "POSTS_POST_UNKNOWN";
            next(err);
        }
    }
});

// 게시글 GET
router.get("/", async (req, res, next) => {
    try {
        const posts = await Posts.findAll({                                    
            attributes: [
                'postId',
                'userId', 
                [Sequelize.col("User.nickname"), 'nickname'], 
                'title', 
                'createdAt', 
                'updatedAt',
                [Sequelize.fn('COUNT', Sequelize.col("Likes.postId")), 'likes'], 
            ],
            include: [
                {model: Users, attributes: []},
                {model: Likes, as:'Likes', attributes: []},
            ],
            group: 'postId',
            order: [['postId', 'DESC']],
        })

        return res.status(200).json({"data": posts});
    } catch (err) {
        err.message = "POSTS_GET_UNKNOWN";
        next(err);
    }
});

// 게시글 상세 조회
router.get("/:postId", async (req, res, next) => {      
    const { postId } = req.params;
    if (postId === 'like') {
        next();
    } else {
        try {
            const post = await Posts.findOne({
                where: {'postId': postId},
                attributes: [
                    'postId',
                    'userId', 
                    [Sequelize.col("User.nickname"), 'nickname'], 
                    'title',
                    'content',
                    'createdAt', 
                    'updatedAt', 
                    [Sequelize.fn('COUNT', Sequelize.col("Likes.postId")), 'likes'], 
                ],
                include: [
                    {model: Users, attributes: []},
                    {model: Likes, as:'Likes', attributes: []},
                ],
            });
            
            if (post.postId === null) {
                throw {message: "POSTS_GET_UNKNOWN"};
            }

            return res.status(200).json({"data": post});
        } catch (err) {
            err.message = "POSTS_GET_UNKNOWN";
            next(err);
        }
    }
});

// 좋아요한 게시글들 조회
router.get("/like", authMiddleware, async (req, res, next) => {      
    try {
        const { userId } = res.locals.user;
        const likes = await Likes.findAll({
            where: {'userId':userId},
            attributes: [
                'postId',
                [Sequelize.col("Post.userId"), 'userId'],
                [Sequelize.col("Post.title"), 'title'],
                [Sequelize.col("Post.content"), 'content'],
                [Sequelize.col("Post.createdAt"), 'createdAt'],
                [Sequelize.col("Post.updatedAt"), 'updatedAt'],
                [Sequelize.fn('COUNT', Sequelize.col("Likes.postId")), 'likes'], 
            ],
            order: [['likes', 'DESC']],
            group: 'postId',
            include: [{
                model: Posts, 
                include: {model: Likes, as: "Likes", attributes: []}, 
                attributes: []}
            ],
        });
        return res.status(200).json({"data": likes});
    } catch (err) {
        err.message = "POSTS_GET_UNKNOWN";
        next(err);
    }
});

// 게시글 수정
router.put("/:postId", authMiddleware, async (req, res, next) => {       
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;  
        const { title, content } = req.body;
        const post = await Posts.findByPk(postId);
        // 게시글 존재하는지 확인
        if (!post) {
            throw {message: "POSTS_GET_UNKNOWN"};
        }
        // 로그인한 계정이 게시글 작성자인지 확인
        if (post.userId !== userId) {
            throw {message: "POSTS_USERID_UNMATCH"};
        }

        if (title.length === 0 || content.length === 0) {
            throw {message: "POSTS_TITLE_CONTENT_NULL"}
        }
        post.title = title;
        post.content = content;
        post.updatedAt = DataTypes.NOW;
        await post.save();

        return res.status(200).json({ message: "게시글을 수정했습니다." });
    } catch (err) {
        if (err.message.includes("POSTS_")) {
            next(err);
        } else {
            err.message = "POSTS_PUT_UNKNOWN";
            next(err);
        }
    }
});

// 게시글 삭제
router.delete("/:postId", authMiddleware, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;        
        const post = await Posts.findByPk(postId);
        // 게시글 존재하는지 확인
        if (!post) {
            throw {message: "POSTS_GET_UNKNOWN"};
        }
        // 로그인한 계정이 게시글 작성자인지 확인
        if (post.userId !== userId) {
            throw {message: "POSTS_USERID_UNMATCH"};
        }
        await post.destroy();
        await Comments.destroy({ where: {"postId": postId}});
        return res.status(200).json({ message: '게시글을 삭제했습니다.' });
    } catch (err) {
        if (err.message.includes("POSTS_")) {
            next(err);
        } else {
            err.message = "POSTS_DELETE_UNKNOWN";
            next(err);
        }
    }
});

// 게시글 좋아요
router.put("/:postId/like", authMiddleware, async (req, res, next) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        // 게시글 있는지 확인
        const post = await Posts.findByPk(postId);
        if (!post) {
            throw {message: "POSTS_GET_UNKNOWN"};
        } // 게시글 작성자인지 확인
        else if (post.userId === userId) {
            throw {message: "POSTS_SAME_ID"};
        }
        // 이미 좋아요 했는지 확인
        const postLike = await Likes.findOne({
            where: {
                [Op.and]: [
                    {'postId': postId},
                    {'userId': userId}
                ]
            }
        });
        if (!postLike) {
            await Likes.create({ postId, userId });
            // const likeCount = await Likes.findAll({'postId':postId})
            // post.likes = likeCount.length;
            // await post.save();
            return res.json({ message : "게시글의 좋아요를 등록했습니다." });
        } else {
            await postLike.destroy();
            // const likeCount = await Likes.findAll({'postId':postId})
            // post.likes = likeCount.length;
            // await post.save();
            return res.json({ message : "게시글의 좋아요를 취소했습니다." });
        }
    } catch (err) {
        if (err.message.includes("POSTS_")) {
            next(err);
        } else {
            err.message = "POSTS_LIKE_UNKNOWN";
            next(err);
        }
    }
});

module.exports = router;