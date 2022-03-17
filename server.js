const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.pzldi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (err, client) {
  
  if(err) {return console.log(err)}
  app.listen(8888, function () {
    console.log('listening on 8888')
  });

})

//서버를 띄우기 위한 기본 셋팅(express 라이브러리)

app.get('/test', function (req, resp) {
  resp.send('테스트입니다.');
});

app.get('/', function (req, resp) {
  resp.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, resp) {
  resp.sendFile(__dirname + '/write.html');
});

app.post('/add', function (req, resp) {
  resp.send('전송완료');
  console.log(req.body);
  console.log(req.body.title);
  console.log(req.body.date);
});