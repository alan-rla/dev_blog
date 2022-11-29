const express = require('express');
const comments = require('../schemas/comments.js');
const router = express.Router();

// Schema 호출
const Posts = require("../schemas/posts.js");
const Comments = require("../schemas/comments.js");

// 게시글 POST
router.post("/posts", async (req, res) => {
    try {
        const { user, password, title, content } = req.body;

        // 제목/내용 있는지 확인
        if (user.length === 0 ||
            password.length === 0 ||
            title.length === 0 ||
            content.length === 0) {
            return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
        }        
        
        // 게시글 작성 시간
        Date.prototype.YYYYMMDDHHMMSS = function () {
            let yyyy = this.getFullYear().toString();
            let MM = pad(this.getMonth() + 1,2);
            let dd = pad(this.getDate(), 2);
            let hh = pad(this.getHours() + 9, 2); // 서버 위치가 미국이라 +9 더해줌
            let mm = pad(this.getMinutes(), 2)
            let ss = pad(this.getSeconds(), 2)
            let ms = pad(this.getMilliseconds(), 3)
        
            return `${yyyy}-${MM}-${dd}T${hh}:${mm}-${ss}.${ms}Z`;
        };

        function pad(number, length) {
            let str = '' + number;
            while (str.length < length) {
            str = '0' + str;
            }
            return str;
        }

        let nowDate = new Date();
        let createdAt = nowDate.YYYYMMDDHHMMSS();

        await Posts.create({ user, password, title, content, createdAt });

        res.json({ "message": "게시글을 생성하였습니다." });
    } catch {
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    }
});

// 게시글 GET
router.get("/posts", async (req, res) => {
    const posts = await Posts.find({});
    const results = posts.map((post) => {
        return {
            "postId": post._id,
            "user": post.user,
            "title": post.title,
            "createdAt": post.createdAt
        }
    });
    res.status(200).json({"data": results});
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;    
    try {
        const result = await Posts.findOne({ "_id" : postId});
        if (!result) {
            return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
        }

        res.status(200).json({"data": {
            "postId": result._id,
            "user": result.user,
            "title": result.title,
            "content": result.content,
            "createdAt": result.createdAt
        }});
    } catch {
        return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    }
});

// 게시글 수정
router.put("/posts/:postId", async (req, res) => {
    // 게시글 조회
    const { postId } = req.params;          
    try {
        const post = await Posts.findOne({ "_id" : postId});

        if (!post) {
            return res.status(400).json({ message: '게시글 조회에 실패하였습니다.' });
        }
    } catch {
        return res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
    }
    
    // 게시글 수정
    try {
        const { password, title, content } = req.body;
        const post = await Posts.findOne({ "_id" : postId});

        if (password !== post.password ||
            title.length === 0 ||
            content.length === 0) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }
    
        await Posts.updateOne({ "_id" : postId},{$set: {
            title : title,
            content : content
        }});
    
        res.status(200).json({ "message": "게시글을 수정하였습니다." });
    } catch {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }

});

// 게시글 삭제
router.delete("/posts/:postId", async (req, res) => {
    const { postId } = req.params;

    // 게시글 검색
    try {
        const post = await Posts.findOne({ "_id" : postId});

        if (!post) {
            return res.status(400).json({ message: '게시글 조회에 실패하였습니다.' });
        }
    } catch {
        return res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
    }

    // 게시글 삭제
    try {
        const { password } = req.body;
        const post = await Posts.findOne({ "_id" : postId});

        if (password !== post.password) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }

        await Posts.deleteOne({ "_id": postId});
        // 게시글에 종속된 댓글도 삭제
        await Comments.deleteMany({ "postId": postId});

        res.json({ "message": "게시글을 삭제하였습니다." });    
    } catch {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

module.exports = router;