const   express = require('express');
const   session = require('express-session');
const   mysql = require('mysql');
const   flash = require('connect-flash');
const   bodyParser = require('body-parser');
const   cookieParser = require('cookie-parser');
const   nodeMailer = require("nodemailer");
const   app = express();
const   port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.urlencoded({
    extended: true
   }))
app.use(cookieParser('secret'));
const db = mysql.createConnection ({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'tiger',
    database: 'nodejs_login'
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

app.use(session({
    secret: 'justasecret',
    resave:true,
    saveUninitialized: true
}));
   
app.use(function(req, res, next) {
res.locals.user = req.session.user;
next();
});

let smtpTransport = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        // should be replaced with real sender's account
        user: 'iliaskadimichannel@gmail.com',
        pass: 'clogkmtxnrvrspba'
    }
  });
global.smtpTransport = smtpTransport;

require('./server/routes')(app);
app.listen(port);