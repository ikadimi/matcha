const   express = require('express');
const   router = express.Router();
const   bcrypt = require('bcrypt');
const   saltRounds = 10;

function  ifUserExists(username) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = ?', [username], function (error, results, fields){
        if (results.length == 0) resolve("username Success")
        else reject("Username Already Exists") 
      })
    })
  }
  
  function  ifEmailExists(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields){
        if (results.length == 0) resolve("Email Success")
        else reject("Email Already Exists") 
      })
    })
  }
  
  function addUser(first_name, last_name, username, hash_pass, email, vkey) {
    return new Promise ((resolve, reject) => {
      const insertQuery = "INSERT INTO users (first_name, last_name, username, password, email, mail_verif, verif_code, online, last_connection) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(insertQuery, [first_name, last_name, username, hash_pass, email, 0, vkey, 0, 0], function (error, results){
        if (error) reject("Query didn't deliver")
        else if (results) {
          link="http://localhost:3001/signup/verify?id="+vkey;
          mailOptions={
              to : email,
              subject : "Please confirm your Email account",
              html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
          }
          resolve(mailOptions)
        }
      })})
  }
  
  function sendVerifMail(mailOptions) {
    return new Promise ((resolve, reject) => {
      smtpTransport.sendMail(mailOptions, function(error, response){
        if(error) reject("mail wasn't sent")
        else {
          resolve(response.message);
        }
        });
    })
  }

  function createImageTable(username) {
    return new Promise ((resolve, reject) => {
      let id;
      const idQuery = "SELECT `id` FROM `users` WHERE `username` = ?"
      db.query(idQuery, [username], (error, results) => {
        if (error) 
          reject("idQuery didn't deliver")
        else if (results.length > 0)
        {
          id = results[0].id;
          const createQuery = "INSERT INTO user_images (id) values (?)"
          db.query(createQuery, [id], (error, results) => {
            if (error) reject("createQuery didn't deliver")
            else
            {
              const prefQuery = "INSERT INTO user_pref (id) values (?)"
              db.query(prefQuery, [id], (error, results) => {
                if (error) reject("prefQuery didn't deliver")
                else if (results) resolve("account and tables are all done")
              })
            }

          })
        }
      })
    })
}

function    ValidateData(first_name, last_name, username, password, email)
{
    return new Promise((resolve, reject) => {
        let regex = new RegExp(/^[a-z][^\W_]{4,20}$/i)
        let mailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        let passRegex = new RegExp(/^(?=[^a-z]*[a-z])(?=\D*\d)[^:&.~\s]{4,20}$/)

        if (!(regex.test(first_name)))
          reject("First name must have between 5 and 20 and only Alphanum")
        else if (!(regex.test(last_name)))
            reject("last name must have between 5 and 20 and only Alphanum")
        else if (!(regex.test(username)))
            reject("Username must have between 5 and 20 and only Alphanum")
        else if (!(mailRegex.test(email)))
            reject("Email is not Valid")
        else if (!(passRegex.test(password)))
            reject("Password requires 1 lower case letter and 1 digit and between 5 and 20")
        else
          resolve("data_clear")
    })
}
  
router.post('/', function(req, res, next){
      var username  = req.body.username;
      var password  = req.body.password;
      var email     = req.body.email;
      var first_name = req.body.first_name;
      var last_name = req.body.last_name;
      var salt      = bcrypt.genSaltSync(saltRounds);
      var hash_pass = bcrypt.hashSync(password, salt);
      var vkey      = Math.random().toString(36).substring(7);
      host = req.get('host');

      ValidateData(first_name, last_name, username, password, email)
      .then(check => ifUserExists(username))
      .then(user => ifEmailExists(email))
      .then(mail => addUser(first_name, last_name, username, hash_pass, email, vkey))
      .then(mailOptions => sendVerifMail(mailOptions))
      .then(image => createImageTable(username))
      .then(send => res.send({status: "success" , msg: "Account was succefully created"}))
      .catch(err => res.send({status: "failure" , msg: err}));
})

router.get('/verify',function(req,res){
  db.query('SELECT `id` FROM `users` WHERE `verif_code` = ?', [req.query.id], function (error, results, fields){
  if (error) res.send({status: "failure", msg: error})
  if (results.length == 1){
      var insertQuery = "UPDATE users SET  mail_verif =  ? WHERE `id` = ?";
      db.query(insertQuery, [1, results[0].id]);
      res.send("<h1 style='margin: auto;color: green'>Email has been Successfully verified");
  }
  else
  {
      res.end("<h1 style='margin: auto;color: red'>BAD REQUEST</h1>");
  }})
})


module.exports = router;