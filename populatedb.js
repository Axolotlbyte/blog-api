#! /usr/bin/env node
// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Article = require('./models/article')
var Comment = require('./models/comment')
var User = require('./models/user')

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      bcrypt.compare(password, user.password, (err,res) => {
        if(err) { return err }
        if(res) {
          return done(null, user)
        } else{
          return done(null, false, { message: "Incorrect Password" })
        }
      })
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var articles = []
var comments = []
var users = []

function commentCreate(user, text, article, cb) {
  commentdetail = {
      user: user, 
      text: text,
      article: article
     }

  var comment = new Comment(commentdetail);
       
  comment.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('Comment: ' + comment);
    comments.push(comment)
    cb(null, comment)
  }  );
}

function articleCreate(user, title, content, date, comment, cb) {
  articledetail = { 
    user: user,
    title: title,
    content: content,
  }
  if(date != false) {articledetail.date = date}
  if(comment != false) {articledetail.comment = comment}
    
  var article = new Article(articledetail);    
  article.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Article: ' + article);
    articles.push(article)
    cb(null, article)
  }  );
}

function userCreate(username,password,mode,cb){

  bcrypt.hash(String(password), 10, (err, hashedPassword) => {
    if(err) {return err}
    const user = new User({
      username: username,
      password: hashedPassword,
      mode: mode,
    }
    ).save(err => {
      if (err) { 
        cb(err, null)
        return
      }
      console.log('New User: ' + user);
      users.push(user)
      cb(null, user)
    });
  });
}

function createUsers(cb) {
  async.parallel([
    function(callback) {
      userCreate('Axolotlbyte','partlycloudy','admin',callback);
    },
    function(callback) {
      userCreate('test-user','test-user','user',callback);
    }
  ],
  cb)
}

function createComments(cb) {
    async.series([

        function(callback) {
          commentCreate(users[0],'First comment!!',articles[0],callback);
        },
        function(callback) {
          commentCreate(users[1],'Test comment',articles[0],callback);
        },
        ],
        // optional callback
        cb);
}

function createArticles(cb) {
  async.parallel([
      function(callback) {
        articleCreate(users[0],'First Blog','First blog posted on this site, Quite excited to see how it goes!! Wish me luck',false,comments[0],callback);
      }
      ],
      // optional callback
      cb);
}

async.series([
    createUsers,
    createArticles,
    createComments
],

// // Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
}
);