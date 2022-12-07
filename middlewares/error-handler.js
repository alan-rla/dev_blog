module.exports = async (err, req, res, next) => {
    // 회원가입 에러핸들러
    if (err.message.includes("USERS_")) {
        if (err.message === "USERS_NICK_FORM") {
            return res.status(412).json({ errorMessage: "닉네임은 3글자 이상의 알파벳,숫자를 입력하세요."});
        } else if (err.message === "USERS_PW_INPUT") {
            return res.status(412).json({ errorMessage: "패스워드를 입력하세요."});
        } else if (err.message === "USERS_PW_LIMIT") {
            return res.status(412).json({ errorMessage: "패스워드를 4글자 이상 입력하세요."});
        } else if (err.message === "USERS_PW_REQ") {
            return res.status(412).json({ errorMessage: "패스워드는 필수 입력 사항입니다."});
        } else if (err.message === "USERS_PW_CONFIRM_REQ") {
            return res.status(412).json({ errorMessage: "패스워드 확인은 필수 입력 사항입니다."});
        } else if (err.message === "USERS_PW_CONFIRM_UNEQUAL") {
            return res.status(412).json({ errorMessage: "패스워드가 일치하지 않습니다."});
        } else if (err.message === "USERS_NICK_REDUNDANT") {
            return res.status(412).json({ errorMessage: "중복된 닉네임이 존재합니다."});
        } else if (err.message === "USERS_NICK_IN_PW") {
            return res.status(412).json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다."});
        } else if (err.message === "USERS_UNKNOWN") {
            return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다."});
        } 
    } 
    // 로그인 에러핸들러
    else if (err.message.includes("LOGIN_")) {
        if (err.message === "LOGIN_FAIL") {
            return res.status(412).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요."});
        } else if (err.message === "LOGIN_UNKNOWN") {
            return res.status(400).json({ errorMessage: "로그인을 실패했습니다."});
        } 
    } 
    // 게시글 에러핸들러
    else if (err.message.includes("POSTS_")) {
        if (err.message === "POSTS_TITLE_CONTENT_NULL") {
            return res.status(412).json({ errorMessage: "게시글 제목/내용의 형식이 올바르지 않습니다."});
        } else if (err.message === "POSTS_POST_UNKNOWN") {
            return res.status(400).json({ errorMessage: "게시글 작성을 실패했습니다."});
        } else if (err.message === "POSTS_GET_UNKNOWN") {
            return res.status(400).json({ errorMessage: "게시글 조회를 실패했습니다."});
        } else if (err.message === "POSTS_USERID_UNMATCH") {
            return res.status(400).json({ errorMessage: "게시글 작성자가 아닙니다."});
        } else if (err.message === "POSTS_PUT_UNKNOWN") {
            return res.status(400).json({ errorMessage: "게시글 수정을 실패했습니다."});
        } else if (err.message === "POSTS_DELETE_UNKNOWN") {
            return res.status(400).json({ errorMessage: "게시글 삭제를 실패했습니다."});
        } else if (err.message === "POSTS_SAME_ID") {
            return res.status(400).json({ errorMessage: "게시글 작성자는 좋아요를 등록할 수 없습니다."});
        } else if (err.message === "POSTS_LIKE_UNKNOWN") {
            return res.status(400).json({ errorMessage: "게시글 좋아요를 실패했습니다."});
        } 
    }
    // 댓글 에러핸들러
    else if (err.message.includes("COMMENTS_")) {
        if (err.message === "COMMENTS_COMMENT_NULL") {
            return res.status(412).json({ errorMessage: "댓글 내용을 입력해주세요."});
        } else if (err.message === "COMMENTS_POST_UNKNOWN") {
            return res.status(400).json({ errorMessage: "댓글 작성을 실패했습니다."});
        } else if (err.message === "COMMENTS_GET_UNKNOWN") {
            return res.status(400).json({ errorMessage: "댓글 조회를 실패했습니다."});
        } else if (err.message === "COMMENTS_ID_UNMATCH") {
            return res.status(400).json({ errorMessage: "댓글 작성자가 아닙니다."});
        } else if (err.message === "COMMENTS_PUT_UNKNOWN") {
            return res.status(400).json({ errorMessage: "댓글 수정을 실패했습니다."});
        } else if (err.message === "COMMENTS_DELETE_UNKNOWN") {
            return res.status(400).json({ errorMessage: "댓글 삭제를 실패했습니다."});
        }
    } else {
        return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다."});
    }
}