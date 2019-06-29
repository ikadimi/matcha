module.exports = function(app){
app.get('/', function(req, res){
    res.render('index.ejs');
})
app.get('/signup', function(req, res){
    res.render('signup.ejs', {error_msg: false});
})
app.get('/login', function(req, res){
    res.render('login.ejs', {error_msg: false});
})
app.get('/forgot_ps', function(req, res){
  res.render('forgot_ps', {error_msg: false, success_msg: false});
})

const   bcrypt = require('bcrypt');
const   saltRounds = 10;
var     mailOptions,host,link;

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

app.post('/forgot_ps', function(req, res){
    var email     = req.body.email;
    var rand      = Math.random().toString(36).substring(7);
    var salt      = bcrypt.genSaltSync(saltRounds);
    var vkey      = bcrypt.hashSync(rand, salt);
    db.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields){
      if (results.length > 0){
        if (results[0].mail_verif == 1){
          host=req.get('host');
          mailOptions={
              to : email,
              subject : "Password resset",
              html : "Hello,<br> Your new password : "+rand 
          }
          console.log(mailOptions);
          smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
                  console.log(error);
              res.end("error");
          }else{
              db.query('UPDATE `users` SET `password` = ? WHERE email = ?',[vkey, email]);
              res.render("forgot_ps", {error_msg: false, success_msg:  "Mail was sent"});
              console.log("Message sent: " + response.message);
              }
          });
        } else
          res.render('forgot_ps', {error_msg:  "Mail is not verified", success_msg: false});
      } else{
        res.render('forgot_ps', {error_msg: "Email address doesn't exist", success_msg: false});
      } 
    })
})

app.post('/signup', function(req, res, next){
    var username  = req.body.username;
    var password  = req.body.password;
    var email     = req.body.email;
    var salt      = bcrypt.genSaltSync(saltRounds);
    var hash_pass = bcrypt.hashSync(password, salt);
    var vkey      = Math.random().toString(36).substring(7);
    console.log(vkey);
    db.query('SELECT * FROM users WHERE username = ?',[username], function (error, results, fields) {
      if (!validateEmail(email)){
        res.render('signup', {error_msg: "Email is not a Valid address"});
      }else{
      if(results.length > 0){
        res.render('signup', {error_msg: "Username Exists"});
      }else{
        db.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
          if(results.length > 0){
            res.render('signup', {error_msg: "Email Exists"});
          }else {
            var insertQuery = "INSERT INTO users (username, password, email, mail_verif, verif_code) values (?, ?, ?, ?, ?)";
            db.query(insertQuery, [username, hash_pass, email, 0, vkey]);
            host=req.get('host');
            link="http://"+req.get('host')+"/verify?id="+vkey;
            mailOptions={
                to : email,
                subject : "Please confirm your Email account",
                html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
            }
            console.log(mailOptions);
            smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                    console.log(error);
                res.end("error");
            }else{
                    console.log("Message sent: " + response.message);
                }
            });
            res.render('login.ejs', {error_msg: false});
          }})
    }}})
})

app.get('/verify',function(req,res){
  console.log(req.protocol+":/"+req.get('host'));
  if((req.protocol+"://"+req.get('host'))==("http://"+host))
  {
      console.log("Domain is matched. Information is from Authentic email");
      db.query('SELECT `username` FROM `users` WHERE `verif_code` = ?',[req.query.id], function (error, results, fields){
      if (results.length == 1){
          var insertQuery = "UPDATE users SET  mail_verif =  ? WHERE `username` = ?";
          db.query(insertQuery, [1, results[0].username]); 
          console.log("email is verified");
          res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
      }
      else
      {
          console.log("email is not verified");
          res.end("<h1>Bad Request</h1>");
      }})
  }
  else
  {
      res.end("<h1>Request is from unknown source");
  }
  });


 app.get('/profile', function(req, res){
    if(req.session.user)
        res.render('profile', {user:  req.session.user});
    else
        res.redirect('/login'); 
 });

app.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
  db.query('SELECT * FROM users WHERE username = ?',[username], function (error, results, fields) {
  if (error) {
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    if(results.length > 0){
      if(bcrypt.compareSync(password, results[0].password)){
        db.query('SELECT `mail_verif` FROM `users` WHERE username = ?',[username], function (error, results, fields){
          if (results[0].mail_verif == 1){
            req.session.user = username;
            res.redirect('/profile');
          }else{
            res.render('login', {error_msg: "Mail is not verified"}); 
          }
        })
      }
      else{
        res.render('login', {error_msg: "Wrong Password"});
      }
    }
    else{
        res.render('login', {error_msg: "Wrong Username"});
      }
  }
});
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
       console.log("user logged out.")
    });
    res.redirect('/login');
 });
 
//  app.use('/profile', function(err, req, res, next){
//  console.log(err);
//     //User should be authenticated! Redirect him to log in.
//     res.redirect('/login');
//  });

app.all('*', function(req, res) {
    res.render("index.ejs");
  });
};