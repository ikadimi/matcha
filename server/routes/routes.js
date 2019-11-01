module.exports = function(app){
app.get('/', function(req, res){
    res.render('index.ejs');
})
app.get('/forgot_ps', function(req, res){
  res.render('forgot_ps', {error_msg: false, success_msg: false});
})

const   bcrypt = require('bcrypt');
const   saltRounds = 10;
const   auth = require('../middleware/auth')

var     mailOptions,link;

app.post('/settings', function(req, res) {
  res.send("got it")
})

app.post('/forgot_ps',  function(req, res){
    var email     = req.body.email;
    var rand      = Math.random().toString(36).substring(7);
    var salt      = bcrypt.genSaltSync(saltRounds);
    var vkey      = bcrypt.hashSync(rand, salt);
    db.query('SELECT * FROM users WHERE email = ?',[email], function (error, results){
        if (error) res.send({status: "failure", msg: error});
        else if (results.length > 0)
        {
            if (results[0].mail_verif == 1)
            {
                host=req.get('host');
                mailOptions={
                    to : email,
                    subject : "Password resset",
                    html : "Hello,<br> Your new password : "+rand 
                }
                console.log(mailOptions);
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if (error)
                        res.send({status: "failure", msg: error});
                    else
                    {
                        db.query('UPDATE `users` SET `password` = ? WHERE email = ?',[vkey, email]);
                        res.send({status: "success", msg:  "Mail was sent"});
                        console.log("Message sent: " + response.message);
                    }
                });
            } 
        else
            res.send({status: "failure", msg: "Mail is not verified"});
        }
        else
            res.send({status: "failure", msg: "Email address doesn't exist"});
    })
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
          res.send("<h1>Email has been Successfully verified");
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

app.all('*', function(req, res) {
    res.render("index.ejs");
  });
};