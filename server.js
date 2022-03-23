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
require('dotenv').config();


MongoClient.connect(process.env.DB_URL, function (error, client) {
  
  if (error) return console.log(error)
  db = client.db('todoapp');

  // db.collection('post').insertOne({이름 : 'John', _id : 20}, function (error, result) {
  //   console.log('저장완료');
  // });

})

app.listen(process.env.PORT, function () {
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

app.get('/list', function (req, resp) { 
  //db에 저장된 post란 collection 안의 모든 데이터를 꺼내주세요
  db.collection('post').find().toArray(function (error, result) {
    console.log(result);
    resp.render('list.ejs', { posts : result });
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


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function (req, resp) {
  resp.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/fail'
}), function (req, resp) {
  resp.redirect('/')
});

app.get('/mypage', logined, function (req, resp) {
  console.log(req.user)
  resp.render('mypage.ejs', {user : req.user})
});

function logined(req, resp, next) {
  if (req.user) {
    next()
  } else {
    resp.send('로그인해주세요')
  }
}


passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

//세션 저장
passport.serializeUser(function (user, done) {
  done(null, user.id)
});

//세션데이터를 가진 사람을 DB에서 찾기
passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({id : 아이디}, function (error, result) {
    done(null, result)
  })
});

//검색기능
app.get('/search', (req, resp) => {
  // console.log(req.query.value);
  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: req.query.value,
          path: "제목"
        }
      }
    },
    // { $sort: { _id: -1 } },
    // { $limit : 5 }
    // { $project : { 제목: 1, _id: 0, score: { $meta: "searchScore" } } }
  ]
  db.collection('post').aggregate(검색조건).toArray((error, result) => {
    // console.log(result);
    resp.render('search.ejs',{posts : result})
  })
});

//가입기능
app.post('/register', function (req, resp) {
  db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, function (error, result) {
    resp.redirect('/')
  })
});

app.post('/add', function (req, resp) {

  resp.send('전송완료');
  // console.log(req.body);
  // console.log(req.body.title);
  // console.log(req.body.date);
  db.collection('counter').findOne({ name: '게시물갯수' }, function (error, result) {
    // console.log(result.totalPost)
    let 총게시물갯수 = result.totalPost;

    let 저장할거 = { _id : 총게시물갯수 + 1, 제목: req.body.title, 날짜: req.body.date, 작성자 : req.user._id }

    db.collection('post').insertOne(저장할거, function (error, result) {
      console.log('저장완료');
      db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (error, result) {
        if(error){return console.log(error)}
      })
    });

  });
});

app.delete('/delete', function (req, resp) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);

  let 삭제할데이터 = { _id : req.body._id, 작성자 : req.user._id }

  db.collection('post').deleteOne(삭제할데이터, function (error, result) {
    console.log('삭제완료');
    if (result) {console.log(result)}
    resp.status(200).send({ message : '성공했습니다' });
  });
});

app.use('/shop', require('./routes/shop.js'));
app.use('/board/sub', require('./routes/board.js'));

//이미지 업로드

let multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/image')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
  filefilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
  }
})
let upload = multer({ storage: storage });

app.get('/upload', function (req, resp) {
  resp.render('upload.ejs')
});

app.post('/upload', upload.single('profile'), function (req, resp) {
  resp.send('완료')
});

app.get('/image/:imageName', function (req, resp) {
  resp.sendFile( __dirname + '/public/image/' + req.params.imageName + '.jpg')
})