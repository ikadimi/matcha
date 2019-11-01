const   express = require('express');
const   session = require('express-session');
const   mysql = require('mysql');
const   flash = require('connect-flash');
const   bodyParser = require('body-parser');
const   cookieParser = require('cookie-parser');
const   nodeMailer = require("nodemailer");
const   config  = require('config');
const   signup = require("./routes/signup")
const   login = require('./routes/login')
const   settings = require('./routes/settings')
const   matches = require('./routes/matches')
const   profile = require('./routes/profile')
const   notif = require('./routes/notif')
const   inbox = require('./routes/inbox')
const   auth    = require('./middleware/auth')
const   app = express();
const   port = process.env.PORT || 3001;
const   host = null;
global.host = host;

app.use(flash() )
app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser('secret'))
const db = mysql.createConnection(config.get('Database'))

db.connect((err) => {
        if (err) {
            throw err;
        }
        /* create chat table */
        let chat = `create table if not exists chat(
            id int primary key auto_increment,
            message text not null,
            id_from int not null,
            id_to int not null,
            time varchar(255) )`;
     
          db.query(chat, function(err, results, fields){
            if (err) {
              console.log(err.message);
            }
          });
          /* end of create table of chat  */
     
          /* create matches table */
          let match = `create table if not exists matches(
            id int primary key auto_increment,
            user1_id int not null,
            user2_id int not null,
            matched int not null DEFAULT 0,
            blocked int not null DEFAULT 0 )`;
     
          db.query(match, function(err, results, fields){
            if (err) {
              console.log(err.message);
            }
          });
          /* end of create match table */
     
     
        /* create notif table table */
        let notif_t = `create table if not exists notifications(
            id int not null,
            visited int not null DEFAULT -1,
            \`like\` int not null DEFAULT -1,
            message int not null DEFAULT -1,
            \`match\` int not null DEFAULT -1,
            unlike int not null DEFAULT -1,
            seen int not null DEFAULT 0,
            action varchar(255) not null,
            time datetime DEFAULT CURRENT_TIMESTAMP)`;
     
            db.query(notif_t, function(err, results, fields){
            if (err) {
                console.log(err.message);
            }
            });
            /* end of create notif table table */
     
            /* create users table */
        let users_t = `create table if not exists users(
            id int primary key auto_increment,
            first_name text not null,
            last_name text not null,
            username text not null,
            password text not null,
            email text not null,
            online int not null DEFAULT 0,
            last_connection varchar(255) not null,
            mail_verif int not null DEFAULT 0,
            verif_code text not null)`;
     
            db.query(users_t, function(err, results, fields){
            if (err) {
                console.log(err.message);
            }
            });
            /* end of create users table */
     
             /* create users table  */
        let user_data_t = `create table if not exists user_data(
            id int not null,
            bio text not null,
            age int not null,
            location text not null,
            myGender text not null,
            otherGender text not null,
            tags text not null,
            background_img varchar(255) not null DEFAULT 'docks',
            fame int not null DEFAULT 0)`;
     
            db.query(user_data_t, function(err, results, fields){
            if (err) {
                console.log(err.message);
            }
            });
            /* end of create user_images table */
     
        let user_images_t = `create table if not exists user_images(
            id int not null,
            profile_img varchar(255) not null DEFAULT 'uploads/p_placeholder.png',
            image_0 varchar(255) not null DEFAULT 'uploads/placeholder.png',
            image_1 varchar(255) not null DEFAULT 'uploads/placeholder.png',
            image_2 varchar(255) not null DEFAULT 'uploads/placeholder.png',
            image_3 varchar(255) not null DEFAULT 'uploads/placeholder.png',
            image_count int not null DEFAULT 0
            )`;
     
            db.query(user_images_t, function(err, results, fields){
            if (err) {
                console.log(err.message);
            }
            });
            /* end of create user_images table */
        /* end of create user_pref table */
        let user_pref_t = `create table if not exists user_pref(
            id int not null,
            ageGap int not null DEFAULT 20,
            distance int not null DEFAULT 100,
            fameGap int not null DEFAULT 4,
            tagNumber int not null DEFAULT 1,
            latitude double not null DEFAULT 0,
            longitude double not null DEFAULT 0,
            autoLocation tinyint(1) DEFAULT 1)`;

            db.query(user_pref_t, function(err, results, fields){
            if (err) {
                console.log(err.message);
            }
            });
            /* end of create user_ipref table */

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
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-auth-token');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
    res.sendStatus(200);
    } else {
    next();
    }
};
app.use(allowCrossDomain);

let smtpTransport = nodeMailer.createTransport(config.get("Mail"));
global.smtpTransport = smtpTransport;

console.log(port);
const server = app.listen(port);

//chat********************/

const io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });
app.use(function (req, res, next) {
    req.io = io;
    next();
})

function    save_message(message, id_from, id_to, time)
{
    return new Promise((resolve, reject) => {
        const msgQuery = "INSERT INTO `chat` (`message`, `id_from`, `id_to`, `time`) VALUES (?, ?, ?, ?)"
        db.query(msgQuery, [message, id_from, id_to, time], (error, results) => {
            if (error) reject("msgQuery didn't deliver")
            else if (results) {
                resolve("success")
            }
        })
    })
}

function    add_notification(type, id_from, id_to)
{
    return new Promise((resolve, reject) => {
        const notifQuery = "INSERT INTO `notifications` (`id`, `" + type + "`, `action`) VALUES (?, ?, ?)"
        db.query(notifQuery, [id_from, id_to, "message"], (error, results) => {
            if (error) reject("notifQuery didn't deliver")
            else if (results) {
                resolve("success")
            }
        })
    })
}

var users = {};

io.on('connection', function(socket) {
    
    socket.on('newUser', function(user){
        users[user] = socket.id;
    })

    socket.on('loggout',  function(user){
        delete users[user]
    })

    socket.on('Notifications', function(data) {
        var soc = users[data.id_to];
        socket.to(soc).emit('Notifications', data)
    });  

    socket.on('SEND_MESSAGE', function(data) {
        var soc = users[data.id_to];
        save_message(data.message, data.id_from, data.id_to, data.time)
        .then(save_msg => add_notification("message", data.id_from, data.id_to))
        .then(ok => socket.to(soc).emit('MESSAGE', data))
        .catch(error => console.log(error)) 
    });
});

function    roomExists(id, matchId)
{
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM chat WHERE ((`id_from` = ? AND `id_to` = ?) OR (`id_from` = ? AND `id_to` = ?))"
        db.query(query, [id, matchId, matchId, id], (error, results) => {
            if (error) reject(error)
            else if (results.length == 0)   resolve("Empty")
            else if (results.length > 0)    resolve("Exists")
        })
    })
}

function    createAdd(id, matchId, msg)
{
    return new Promise((resolve, reject) => {
        if (msg === "Empty")
            resolve("Empty")
        else if (msg === "Exists")
        {
            const query = "SELECT `message`, `id_from`, `id_to`, `time` FROM chat WHERE ((`id_from` = ? AND `id_to` = ?) OR (`id_from` = ? AND `id_to` = ?))"
            db.query(query, [id, matchId, matchId, id], (error, results) => {
                if (error) reject("matchQuery2 didn't deliver")
                else if (results)  {
                    resolve(results)
                }
            })
        }
    })
}

app.post('/openChat', auth, (req, res) => {
    var id = req.id
    var matchId = req.body.matchId

    roomExists(id, matchId)
    .then(results => createAdd(id, matchId, results))
    .then(message => res.send(message))
    .catch(error => res.send(error))
})

app.use('/signup', signup);
app.use('/login', login);
app.use('/settings', settings);
app.use('/matches', matches);
app.use('/profile', profile);
app.use('/notif', notif);
app.use('/inbox', inbox);
//*********************************** */