const express = require('express');
const router = express.Router();

// Schema 호출
const Posts = require("../schemas/posts.js");
const Comments = require("../schemas/comments.js");

router.post("/comments/:postId", async (req, res) => {
    const { postId } = req.params;
    try {        
        const post = await Posts.findOne({ "_id" : postId});

        if (!post) {
            return res.status(400).json({ message: "존재하지 않는 게시글입니다." });
        }
    } catch {
        return res.status(400).json({ message: "존재하지 않는 게시글입니다." });
    }

    try {
        const { user, password, content } = req.body;

        if (content.length === 0) {
            return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
        }

        if (user.length === 0 ||
            password.length === 0) {
            return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
        }

        // 게시글 작성 시간
        Date.prototype.YYYYMMDDHHMMSS = function () {
            let yyyy = this.getFullYear().toString();
            let MM = pad(this.getMonth() + 1,2);
            let dd = pad(this.getDate(), 2);
            let hh = pad(this.getHours(), 2);
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

        await Comments.create({ user, password, content, createdAt, postId });

        res.json({ "message": "댓글을 생성하였습니다." });
    } catch {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

// 댓글 GET
router.get("/comments/:postId", async (req, res) => {
    const { postId } = req.params;

    try {        
        const post = await Posts.findOne({ "_id" : postId});

        if (!post) {
            return res.status(400).json({ message: "존재하지 않는 게시글입니다." });
        }
    } catch {
        return res.status(400).json({ message: "존재하지 않는 게시글입니다." });
    }

    try {
        const comments = await Comments.find({ postId });

        const results = comments.map((comment) => {
            return {
                "commentId": comment._id,
                "user": comment.user,
                "content": comment.content,
                "createdAt": comment.createdAt
            }
        });
        res.status(200).json({"data": results});
    } catch {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

// 댓글 수정
router.put("/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;    
        
    try {
        const comment = await Comments.findOne({ "_id" : commentId});

        if (!comment) {
            return res.status(400).json({ message: '댓글 조회에 실패하였습니다.' });
        }
    } catch {
        return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
    }

    try {
        const { password, content } = req.body;
        const comment = await Comments.findOne({ "_id" : commentId});

        if (content.length === 0) {
            return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
        }

        if (password !== comment.password) {
            return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
        }
    
        await Comments.updateOne({ "_id" : commentId},{$set: {
            content : content
        }});
    
        res.status(200).json({ "message": "댓글을 수정하였습니다." });
    } catch {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

// 댓글 삭제
router.delete("/comments/:commentId", async (req, res) => {
    const { commentId } = req.params;

    // 댓글 검색
    try {
        const comment = await Comments.findOne({ "_id" : commentId });

        if (!comment) {
            return res.status(400).json({ message: '댓글 조회에 실패하였습니다.' });
        }
    } catch {
        return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
    }

    // 댓글 삭제
    try {
        const { password } = req.body;
        const comment = await Comments.findOne({ "_id" : commentId});

        if (password !== comment.password) {
            return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
        }

        await Comments.deleteOne({ "_id": commentId});

        res.json({ "message": "댓글을 삭제하였습니다." });    
    } catch {
        return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

module.exports = router;