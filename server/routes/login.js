const   express = require('express');
const   router = express.Router();
const   bcrypt = require('bcrypt');
const   jwt = require('jsonwebtoken');
const   moment = require('moment')
let     token = null;

function    usernameExists(username) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE username = ?',[username], function (error, results, fields) {
            if (results.length == 1) resolve("username Success") 
            else reject("Wrong Username")
        })
    })
}

function    correctPassword(username, password) {
    return new Promise((resolve, reject) => {
        db.query('SELECT password FROM users WHERE username = ?',[username, password], function (error, results, fields) {
            if (bcrypt.compareSync(password, results[0].password)) resolve("password Success") 
            else reject("Wrong Password")
        })
    })
}

function    online_user(id)
{
    return new Promise((resolve, reject) => {
        const onlineQuery = "UPDATE `users` SET `online` = ?, `last_connection` = ? WHERE `id` = ?"
        db.query(onlineQuery, [1, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"), id], (error, results) => {
            if (error) reject("onlineQuery didn't deliver")
            else if (results){
                resolve("Welcome")       
            }
        })
    })
}

function   isMailVerif(username, req) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM `users` WHERE username = ?',[username], function (error, results, fields){
            if (results[0].mail_verif == 1){
                token = jwt.sign({ id: results[0].id}, 'jwtPrivateKey');
                resolve(results[0].id)
            } else reject("Mail is not verified")
        })
    })
}

router.post('/', function(req, res){
    let username = req.body.username;
    let password = req.body.password;

    usernameExists(username)
    .then (name => correctPassword(username, password))
    .then (pass => isMailVerif(username))
    .then(id => online_user(id))
    .then (mail => res.send({status: "success" , authToken: token, id: jwt.verify(token, "jwtPrivateKey")}))
    .catch (err => res.send({status: "failure" , msg: err}))
});

router.post('/logout', function(req, res) {
    const logoutQuery = "UPDATE `users` SET `online` = ?, `last_connection` = ? WHERE `id` = ?"
    db.query(logoutQuery, [0, moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"), req.body.id], (error, results) => {
            if (error) res.send({status: "failure", id: "logoutQuery didn't deliver"})
            else if (results){
                res.send({status: "success", id: req.body.id})       
            }
        })
})

router.post('/forgot_ps',  function(req, res){
    var email     = req.body.email;
    var rand      = Math.random().toString(36).substring(7);
    var salt      = bcrypt.genSaltSync(10);
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
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if (error)
                        res.send({status: "failure", msg: error});
                    else
                    {
                        db.query('UPDATE `users` SET `password` = ? WHERE email = ?',[vkey, email]);
                        res.send({status: "success", msg:  "Mail was sent"});
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

module.exports = router;