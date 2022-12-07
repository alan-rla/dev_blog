const express = require('express');
const router = express.Router();

const usersRouter = require("./users.js");
const loginRouter = require("./login.js");
const postsRouter = require("./posts.js");
const commentsRouter = require("./comments.js");

router.use('/users', [usersRouter]);
router.use('/login', [loginRouter]);
router.use('/posts', [postsRouter]);
router.use('/comments', [commentsRouter]);

module.exports = router;