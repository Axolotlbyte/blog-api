var express = require('express');
var router = express.Router();
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')

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

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


router.post('sing-up', (req, res, next) => {
  bcrypt.hash(String(req.body.password), 10, (err, hashedPassword) => {
    if(err) {return err}
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      mode: 'user'
    }
    ).save(err => {
      if (err) { 
        return next(err);
      }
      res.json("User Added");
    });
  });
})

app.post(
  "/log-in",
  passport.authenticate("local", {   
    successRedirect: "/",
    failureRedirect: "/"
  })
);


app.get("/log-out", (req, res) => {
  req.logout();
  res.json('Logged Out Successfully')
  res.redirect("/");
});


module.exports = router;
