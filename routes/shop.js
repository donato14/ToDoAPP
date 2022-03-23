let router = require('express').Router();



router.get('/shirts', function (req, resp) {
  resp.send('셔츠를 파는 페이지입니다.');
});

router.get('/pants', function (req, resp) {
  resp.send('바지를 파는 페이지입니다.');
});

module.exports = router;