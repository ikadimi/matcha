const   express = require('express');
const   session = require('express-session');
const   mysql = require('mysql');
const   flash = require('connect-flash');
const   bodyParser = require('body-parser');
const   cookieParser = require('cookie-parser');
const   nodeMailer = require("nodemailer");
const   app = express();
const   port = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.json())
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
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
    res.sendStatus(200);
    } else {
    next();
    }
};
app.use(allowCrossDomain);

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

require('./router/routes')(app);

console.log(port);
app.listen(port);
