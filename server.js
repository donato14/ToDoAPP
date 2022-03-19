const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { redirect } = require('express/lib/response');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const MongoClient = require('mongodb').MongoClient;
let db;


MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.pzldi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (error, client) {
  
  if (error) return console.log(error)
  db = client.db('todoapp');

  // db.collection('post').insertOne({이름 : 'John', _id : 20}, function (error, result) {
  //   console.log('저장완료');
  // });

})

app.listen(8888, function () {
  console.log('listening on 8888')
});
//서버를 띄우기 위한 기본 셋팅(express 라이브러리)

app.get('/test', function (req, resp) {
  resp.send('테스트입니다.');
});

app.get('/', function (req, resp) {
  resp.render('index.ejs');
});

app.get('/write', function (req, resp) {
  resp.render('write.ejs');
});

app.post('/add', function (req, resp) {
  resp.send('전송완료');
  // console.log(req.body);
  // console.log(req.body.title);
  // console.log(req.body.date);
  db.collection('counter').findOne({ name: '게시물갯수' }, function (error, result) {
    console.log(result.totalPost)
    let 총게시물갯수 = result.totalPost;

    db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date }, function (error, result) {
      console.log('저장완료');
      db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (error, result) {
        if(error){return console.log(error)}
      })
    });

  });
});

app.get('/list', function (req, resp) { 
  //db에 저장된 post란 collection 안의 모든 데이터를 꺼내주세요
  db.collection('post').find().toArray(function (error, result) {
    console.log(result);
    resp.render('list.ejs', { posts : result });
  });
  
});

app.delete('/delete', function (req, resp) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, function (error, result) {
    console.log('삭제완료');
    resp.status(200).send({ message : '성공했습니다' });
  });
});

app.get('/detail/:id', function (req, resp) {
  db.collection('post').findOne({_id : parseInt(req.params.id)}, function (error, result) {
    console.log(result);
    resp.render('detail.ejs', { data: result })
    if (result == null) {
      resp.render('error.ejs');
    }
  })
});

app.get('/edit/:id', function (req, resp) { 
  db.collection('post').findOne({ _id: parseInt(req.params.id) }, function(error, result) {
    console.log(result);
    resp.render('edit.ejs', { data: result })
    if (result == null) {
      resp.render('error.ejs')
    }
  })
});

app.put('/edit', function (req, resp) { 
  db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : { 제목:req.body.title, 날짜:req.body.date}}, function (error, result) {
    console.log('수정완료')
    resp.redirect('/list')
  })
});