const   express = require('express');
const   router  = express.Router();
const   auth    = require('../middleware/auth')

router.post('/profileVisit', async (req, res) => {
    id = req.body.visitorId
    if (!id)
        res.send("failure");
    const query = "SELECT * FROM users INNER JOIN user_data INNER JOIN user_images ON users.id where users.id = ? AND user_data.id = ? AND user_images.id = ?"
    await db.query(query, [id, id, id], function(error, results, fields) {
        if (error) {
            res.send("visitorQuery didn't deliver")}
        else if (results.length == 1) {
            const userData = {
                fame: results[0].fame,
                id: results[0].id,
                age: results[0].age,
                location: results[0].location,
                username: results[0].username,
                first_name: results[0].first_name,
                last_name: results[0].last_name,
                email: results[0].email,
                password: '',
                bio: results[0].bio,
                myGender: results[0].myGender,
                otherGender: results[0].otherGender,
                tags: results[0].tags.split(","),
                profile_img: results[0].profile_img,
                background_img: results[0].background_img,
                online: results[0].online,
                last_connection: results[0].last_connection,
                images: [results[0].image_0, results[0].image_1, results[0].image_2, results[0].image_3]
            }
            res.send({setData: userData, msg: "all good"});
        }
    })
})

router.get('/userLocation', auth, async (req, res) => {
    const query = "SELECT `latitude`, `longitude`, `autoLocation` FROM user_pref WHERE id = ?"
    await db.query(query, [req.id], (error, results) => {
        if (error) res.send("locationquery didn't deliver")
        else if (results.length > 0) res.send(results[0])
    })
})

router.post('/newPos', auth, async (req, res) => {
    const query = "UPDATE user_pref SET `latitude` = ?, `longitude` = ?, `autoLocation` = ? WHERE id = ?"
    await db.query(query, [req.body.latitude, req.body.longitude, req.body.autoLocation, req.id], (error, results) => {
        if (error) res.send("newPosQuery didn't deliver")
        else if (results) res.send("success")
    })
})

function    ifMatched(id, visitedId)
{
    return new Promise((resolve, reject) => {
        const   query = "SELECT * FROM `matches` WHERE (matched = 1 AND blocked = 0) AND ((user1_id = ? AND user2_id = ?) || (user1_id = ? AND user2_id = ?))"
        db.query(query, [id, visitedId, visitedId, id], (error, results) => {
            if (error) reject("statusQuery didn't dilver")
            else if (results.length == 1)  resolve("matched")
            else if (results.length == 0)  resolve("nop")
        })
    })
}

function    ifBlocked(id, visitedId, resp)
{
    return new Promise((resolve, reject) => {
        if (resp == "matched")
            resolve("matched")
        const   query = "SELECT * FROM `matches` WHERE blocked = 1 AND ((user1_id = ? AND user2_id = ?) || (user1_id = ? AND user2_id = ?))"
        db.query(query, [id, visitedId, visitedId, id], (error, results) => {
            if (error) reject("statusQuery 1 didn't dilver")
            else if (results.length == 1)  resolve("blocked")
            else if (results.length == 0)  resolve("nop")
        })
    })
}

function    ifLiked(id, visitedId, resp)
{
    return new Promise((resolve, reject) => {
        if (resp == "matched")
            resolve("matched")
        else if (resp == "blocked")
            resolve("blocked")
        const   query = "SELECT * FROM `matches` WHERE user1_id = ? AND user2_id = ?"
        db.query(query, [id, visitedId], (error, results) => {
            if (error) reject("statusQuery 2 didn't dilver")
            else if (results.length == 1)  resolve("liked")
            else if (results.length == 0)  resolve("nop")
        })
    })
}

function    otherSideLike(id, visitedId, resp)
{
    return new Promise((resolve, reject) => {
        if (resp !== "nop")
            resolve(resp)
        const   query = "SELECT * FROM `matches` WHERE user1_id = ? AND user2_id = ?"
        db.query(query, [visitedId, id], (error, results) => {
            if (error) reject("statusQuery 2 didn't dilver")
            else if (results.length == 1)  resolve("other_liked")
            else if (results.length == 0)  resolve("nop")
        })
    })
}

router.post('/profileStatus', auth, (req, res) => {
    ifMatched(req.id, req.body.visitedId)
    .then(resp => ifBlocked(req.id, req.body.visitedId, resp))
    .then(response => ifLiked(req.id, req.body.visitedId, response))
    .then(last => otherSideLike(req.id, req.body.visitedId, last))
    .then(finish => res.send(finish))
    .catch(error => res.send(error))
})

function    Isuser_blocked(userId, visitedId)
{
    return new Promise((resolve, reject) => {
        checkQuery = "SELECT * FROM `matches` WHERE blocked = 1 AND ((user1_id = ? AND user2_id = ?) || (user1_id = ? AND user2_id = ?))"
        db.query(checkQuery, [userId, visitedId, visitedId, userId], (error, results) => {
            if (error) reject(error)
            else if (results.length == 0) resolve("all good")
            else if (results.length == 1) resolve("blocked")
        })
    })
}

function    addHistory(userId, visitedId, req, msg)
{
    return new Promise((resolve, reject) => {
        if (msg === "blocked")
        {
            reject("blocked")
        }
        else 
        {
            const historyQuery = "INSERT INTO `notifications` (`id`, `visited`, action) VALUES (?, ?, ?)"
            db.query(historyQuery, [userId, visitedId, "visit"], (error, results) => {
                if (error) reject("historyQuery didn't dilver")
                else if (results) {
                    req.io.emit('first_Notifications', {id_to: req.body.visitedId})
                    resolve("visit added")}
            })
        }
    })
}

router.post('/addHistory', auth, (req, res) => {
    Isuser_blocked(req.id, req.body.visitedId)
    .then(check => addHistory(req.id, req.body.visitedId, req, check))
    .then(finish => res.send(finish))
    .catch(error => res.send(error))
    
})

router.post('/reportUser', auth, (req, res) => {
    mailOptions={
        to : "ilkadimi@outlook.com",
        subject : "profile reported",
        html : "Hello,<br> this user was reported please check if he's legit or not.<br> he's id : "+req.body.reportedId
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
        if (error)
            res.send(error);
        else
            res.send("success")
    })
})

router.get('/loadInfo', auth, async (req, res) => {
    let query = "SELECT `username`, `first_name`, `last_name`, `profile_img` FROM `users` INNER JOIN `user_images` ON users.id where users.id = user_images.id AND user_images.id = ?"
    await db.query(query, [req.id], (error, results) => {
        if (error) res.send({status: "failure", msg: error})
        else if (results.length == 1) {
            res.send({status: "success", msg: results[0]})}
    })
})

module.exports = router;