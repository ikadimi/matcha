const   express = require('express');
const   router = express.Router();
const   multer  = require('multer')
const   path    = require('path')
const   fs      = require('fs-extra')
const   bcrypt  = require('bcrypt');
const   auth    = require('../middleware/auth')
const   saltRounds = 10;
const   ipInfo = require("ipinfo");
let     fileName

const   storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const id = req.id
        let path = `../client/public/uploads/${id}`;
        fs.mkdirsSync(path);
        callback(null, path);
    },
        filename: (req, file, callback) => {
        if (req.params.id == 1)
            callback(null, "profile_img.png");
        else if (req.params.id == 2)
        {
            fileName = Date.now() + "_" + req.id + ".png"
            callback(null, fileName)
        }
    }
})

const   upload = multer({
    storage: storage,
    limits:{fileSize: 4000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('myImage');

function    checkFileType(file, cb){
    const   filetypes = /jpeg|jpg|png/
    const   extname   = filetypes.test(path.extname(file.originalname).toLowerCase())
    const   mimetype  = filetypes.test(file.mimetype)

    if (mimetype && extname)
        return cb(null, true)
    else
        return cb('Error: Images Only')
}

function    ValidateData(username, email, password)
{
    return new Promise((resolve, reject) => {
        let regex = new RegExp(/^[a-z][^\W_]{4,20}$/i)
        let mailRegex = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        let passRegex = new RegExp(/^(?=[^a-z]*[a-z])(?=\D*\d)[^:&.~\s]{4,20}$/)

        if (password === '' || password === undefined)
        {
            if (!(regex.test(username)))
            reject("username must have between 5 and 20 characters of type Alphanum")
            else if (!(mailRegex.test(email)))
                reject("E-mail Address is invalid")
            else
                resolve("all good")
        }
        else
        {
            if (!(regex.test(username)))
                reject("username must have between 5 and 20 characters of type Alphanum")
            else if (!(passRegex.test(password)))
                reject("Password requires 1 lower case letter and 1 digit and between 5 and 20")
            else if (!(mailRegex.test(email)))
                reject("E-mail Address is invalid")
            else
                resolve("all good")
        }
    })
}

function    correct_pass(id, email, password)
{
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE id = ?',[id], function (error, results, fields) {
            if (bcrypt.compareSync(password, results[0].password))
            {
                if (email === results[0].email)
                    resolve("same email")
                else
                    resolve("diffrent email") 
            }
            else reject("Wrong Password")
        })
    })
}

function    update_data(msg, id, username, email, password)
{
    return new Promise((resolve, reject) => {
        let salt      = bcrypt.genSaltSync(saltRounds);

        if (msg == "diffrent email")
        {
            if (password === '' || password === undefined)
            {
                let query = "UPDATE `users` SET `username`=?, `email`=?, `verif_code`=? where id=?"
                db.query(query, [username, email, 0, id], (error, results) => {
                    if (error) reject("query didn't fire")
                    else resolve("Data updated")
                })
            }
            else
            {
                let hash_pass = bcrypt.hashSync(password, salt);
                let query = "UPDATE `users` SET `username`=?, `email`=?, `password`=?, `mail_verif`=?, `verif_code`=? where id=?"
                db.query(query, [username, email, hash_pass, 0, 0, id], (error, results) => {
                if (error) reject("query didn't fire")
                else resolve("Data updated")
            })
            }
        }
        else
        {
            if (password === '' || password === undefined)
            {
                let query = "UPDATE `users` SET `username`=? where id=?"
                db.query(query, [username, id], (error, results) => {
                    if (error) reject("query didn't fire")
                    else resolve("Data updated")
                })
            }
            else 
            {
                let hash_pass = bcrypt.hashSync(password, salt);
                let query = "UPDATE `users` SET `username`=?, `password`=? where id=?"
                db.query(query, [username, hash_pass, id], (error, results) => {
                    if (error) reject("query didn't fire")
                    else resolve("Data updated")
                })
            }
        }
    })
}

router.post('/secureUpdate', auth, (req, res) => {
    const id = req.id;

    ValidateData(req.body.username, req.body.email, req.body.newPassword)
    .then(valid => correct_pass(id, req.body.email, req.body.currentPassword))
    .then(password => update_data(password, id, req.body.username, req.body.email, req.body.newPassword))
    .then(finish => res.send({status: "success", msg: finish}))
    .catch(err => res.send({status: "failure", msg: err}))
})


function    checkNewData(body)
{
    return new Promise((resolve, reject) => {
        let backgrounds = ['docks', 'mountains', 'sunshine', 'road', 'techno', 'asakusa', '1337']
        let genders = ["Man", "Woman", "Other"]
        let regex = new RegExp(/^[a-z][^\W_]{4,20}$/i)
        let bioregex = new RegExp(/^.{4,100}$/i) 

        if (!(regex.test(body.first_name)))
          reject("First name must have between 5 and 20 characters of type Alphanum")
        else if (!(regex.test(body.last_name)))
            reject("last name must have between 5 and 20 characters of type Alphanum")
        else if (!(bioregex.test(body.bio)))
            reject("Bio must have between 5 and 100 characters")
        else if (body.age < 18 || body.age > 60)
            reject("Age Between 18 and 60")
        else if (!(regex.test(body.location)))
          reject("Location must have between 5 and 20 characters of type Alphanum")
        else if (backgrounds.indexOf(body.background_img) < 0)
            reject("please select one of the offered background")
        else if (genders.indexOf(body.myGender) < 0 || genders.indexOf(body.otherGender) < 0)
            reject("please select one of the offered genders")
        else if (body.tags.length != 5)
            reject("please select exactly 5 tags")
        else
            resolve("all good")
    })
}

router.post('/dataUpdate', auth, async (req, res) => {
    const id            = req.id
    const tags          = req.body.tags.join()
    const checkQuery    = "SELECT * FROM `user_data` where id = ?"
    const insertQuery   = "INSERT INTO `user_data`(`id`, `bio`, `age`, `location`, `myGender`, `otherGender`, `tags`) VALUES (?,?,?,?,?,?,?)";
    const updateQuery   = "UPDATE `user_data` SET `bio`=?,`age`=?,`location`=?,`myGender`=?,`otherGender`=?,`tags`=?, `background_img`=? WHERE id = ?";
    const usersQuery    = "UPDATE `users` SET `first_name`=?,`last_name`=? WHERE id = ?"

    checkNewData(req.body)
    .then(resolved => {
        db.query(checkQuery, [id], function(error, results) {
            if (error) 
                res.send({status: 'failure', msg: error})
            else if (results)
            {
                db.query(usersQuery, [req.body.first_name, req.body.last_name, id],
                    (error) => {
                        if (error)
                            res.end({status: 'failure', msg: "usersQuery didn't deliver"})
                })
                if (results.length == 0){
                    db.query(insertQuery, [id, req.body.bio, req.body.age, req.body.location, req.body.myGender, req.body.otherGender, tags],
                    (error, results) => {
                            if (error) 
                                res.send({status: 'failure', msg: "insertQuery didn't deliver"})
                            else if (results) 
                                res.send({status: 'success', msg: "insert new data"})
                        })
                    }
                else if (results.length > 0) {
                    db.query(updateQuery, [req.body.bio, req.body.age, req.body.location, req.body.myGender, req.body.otherGender, tags, req.body.background_img, id],
                        (error, results) => {
                            if (error) {
                                res.send({status: 'failure', msg: "updateQuery didn't deliver"})
                            }
                            else if (results) res.send({status: 'success', msg: "updated old data"})
                    })
                }
            }
        })
    })
    .catch(error => res.send({status: 'failure', msg: error}))
})

router.get('/pageLoad', auth, async (req, res) => {
    const id = req.id;
    const query = "SELECT * FROM users INNER JOIN user_data INNER JOIN user_images ON users.id where users.id = ? AND user_data.id = ? AND user_images.id = ?"
    const backupQuery = "SELECT * FROM users INNER JOIN user_images ON users.id where users.id = ? AND user_images.id = ?"
    await db.query(query, [id, id, id], function(error, results, fields) {
        if (error) {
            res.end(error)}
        else if (results.length > 0) 
        {
            const userData = {
                fame: results[0].fame,
                id: results[0].id,
                age: results[0].age,
                location: results[0].location,
                username: results[0].username,
                first_name: results[0].first_name,
                last_name: results[0].last_name,
                email: results[0].email,
                newPassword: '',
                currentPassword: '',
                bio: results[0].bio,
                myGender: results[0].myGender,
                otherGender: results[0].otherGender,
                tags: results[0].tags.split(","),
                profile_img: results[0].profile_img,
                background_img: results[0].background_img,
                images: [results[0].image_0, results[0].image_1, results[0].image_2, results[0].image_3]
            }
            res.send({setData: userData, msg: "all good"});
        }
        else if (results.length == 0) {
            db.query(backupQuery, [id, id], (error, results) => {
                if (error) res.end(error)
                else
                {
                    const backupData = {
                        fame: 0,
                        id: results[0].id,
                        age: 18,
                        location: '',
                        username: results[0].username,
                        first_name: results[0].first_name,
                        last_name: results[0].last_name,
                        email: results[0].email,
                        newPassword: '',
                        currentPassword: '',
                        bio: 'Searching for Love',
                        myGender: 'Other',
                        otherGender: 'Other',
                        tags: [],
                        profile_img: results[0].profile_img,
                        background_img: 'docks',
                        images: [results[0].image_0, results[0].image_1, results[0].image_2, results[0].image_3]
                    }
                    res.send({setData: backupData, msg: "user don't have data"});
                }
            })
            
        }
    })
})

router.post('/uploadImg/:id' , auth, (req, res) => {
    if (req.params.id != 1 && req.params.id != 2)
        res.send("wrong option how did you know the path anyway")
    else
    {
        upload(req, res, async (err) => 
        {
            if (err)
                res.send({status: "failure", msg: err}) 
            else   
            {
                if (req.file == undefined)
                    res.send({status: "failure", msg: "Error: No File Selected"})
                else
                {
                    if (req.params.id == 2)
                    {
                        const id = req.id
                        const query = "SELECT * FROM `user_images` where id = ?"
                        await db.query(query, [id], (error, results) => {
                            if (results.length > 0 && results[0].image_count <= 4)
                            {
                                const count = results[0].image_count
                                const addQuery = "UPDATE user_images SET `image_count` = `image_count` + 1 ,`image_?` = ? where id = ?"
                                var name = "image_" + count
                                db.query(addQuery, [count, "uploads/"+id+"/"+fileName, id], (error, results) => {
                                    if (error) 
                                        res.send({status: "failure", msg: "error when inseting image to database"})
                                    if (results)
                                        res.send({status: "success", msg: "image was successfuly uploaded", img: "uploads/"+id+"/"+fileName, count: count})
                                })
                            }
                            else
                                res.send({status: "failure", msg: "somthing went wrong"})
                        })
                    }
                    else
                    {
                        const profileQuery = "UPDATE user_images SET `profile_img` = ? where id = ?"
                        db.query(profileQuery, ["uploads/"+req.id+"/profile_img.png", req.id], (error, results) => {
                            if (error) 
                                res.send({status: "failure", img: "profile image query error"})
                            else if (results) 
                                res.send({status: "success", img: "uploads/"+req.id+"/profile_img.png"})
                        })
                    }
                }
            }
        })
    }
})

function    order_images(id, index)
{
    return new Promise((resolve, reject) => {
        const query = "SELECT * from user_images where id = ?"
        db.query(query, [id], (error, results) => {
            if (results.length > 0)
            {
                let orderQuery
                if (index == 0)
                {
                    orderQuery = "UPDATE user_images SET `image_0` = ?, `image_1` = ?, `image_2` = ? , `image_3` = ? where id = ?"
                    db.query(orderQuery, [results[0].image_1, results[0].image_2, results[0].image_3, "uploads/placeholder.png", id], (error) => {
                        if (error) reject("swap error")
                    })
                }
                else if (index == 1)
                {
                    orderQuery = "UPDATE user_images SET  `image_1` = ?, `image_2` = ?, `image_3` = ? where id = ?"
                    db.query(orderQuery, [results[0].image_2, results[0].image_3, "uploads/placeholder.png", id], (error) => {
                        if (error) reject("swap error")
                    })
                }
                else if (index == 2)
                {
                    orderQuery = "UPDATE user_images SET  `image_2` = ?, `image_3` = ? where id = ?"
                    db.query(orderQuery, [results[0].image_3, "uploads/placeholder.png", id], (error) => {
                        if (error) reject("swap error")
                    })
                }
                returnQuery = "SELECT * FROM user_images where id = ?"
                db.query(returnQuery, [id], (error, results) => {
                    if (error) reject("return images error")
                    if (results) resolve([results[0].image_0, results[0].image_1, results[0].image_2, results[0].image_3])
                })
            }
            else
                reject("swap error")
        })
    })
}

router.post('/deleteImg/:id', auth, async (req, res) => {
    if (req.params.id != 0 && req.params.id != 1 && req.params.id != 2 && req.params.id != 3)
        res.send("a5ir merra ola may3bk 7al")
    else
    {
        const id = req.id
        const img_name = "image_" + req.params.id
        const query = "SELECT * FROM `user_images` where id = ?"
        await db.query(query, [id], async (error, results) => {
            if (error) res.send("something went wrong")
            if (results.length > 0 && results[0].image_count >= 0)
            {
                let name
                if (req.params.id == 0)
                    name = results[0].image_0
                else if (req.params.id == 1)
                    name = results[0].image_1
                else if (req.params.id == 2)
                    name = results[0].image_2
                else if (req.params.id == 3)
                    name = results[0].image_3
            const delQuery = "UPDATE user_images SET `image_count` = `image_count` - 1 , `" +img_name+"`  = ? where id = ?"
            await  db.query(delQuery, ["uploads/placeholder.png" , id], (error, results) => {
                if (error) res.send({status: "failure", img: "error when deleting image from database " + " " + id})
                else {
                        fs.unlink("../client/public/" + name, (err) => {
                            // if(err && err.code == 'ENOENT') 
                            //     res.send({status: "failure", img: "File doesn't exist, won't remove it."});
                            if (err && err.code !== 'ENOENT') 
                                res.send({status: "failure", img: "Error occurred while trying to remove file"});
                            else
                            {
                                order_images(id, req.params.id)
                                .then(response => res.send({status: "success", img: response}))
                                .catch(err => res.send({status: "failure", img: err}))
                            }
                        })
                    }
                })
            }
            else
                res.end("wrong id")
        })    
    }
})

router.post('/userLocation', auth, async (req, res) => {
    id = req.id
    const query = "UPDATE user_pref SET `latitude` = ?, `longitude` = ? where id = ? AND autoLocation = 1"
    await db.query(query, [req.body.latitude, req.body.longitude, id], (error, results) => {
        if (error) res.send("Error when updating user location")
        else if (results) res.send("success")
    })
})

router.get('/ipAddress', auth, (req, res) => {
    ipInfo(async (err, cLoc) => {
       if (cLoc)
       {
        let cord = cLoc.loc.split(',')
        const query = "UPDATE user_pref SET `latitude` = ?, `longitude` = ? where id = ? AND autoLocation = 1"
        await db.query(query, [cord[0], cord[1], req.id], (error, results) => {
            if (error) res.send("Error when updating user location")
            else if (results) res.send("success")
        })
       }
       else if (err)
        res.send(err)
    })
})

module.exports = router;