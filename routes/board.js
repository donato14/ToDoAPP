let router = require('express').Router();

function logined(req, resp, next) {
  if (req.user) {
    next()
  } else {
    resp.send('로그인해주세요')
  }
}

router.use(logined);

// router.use('/shirts',logined); //특정 URL에만 적용

router.get('/sports', function (req, resp) {
  resp.send('스포츠 게시판');
});

router.get('/game', function (req, resp) {
  resp.send('게임 게시판');
});

module.exports = router;