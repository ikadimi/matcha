const   express = require('express');
const   router  = express.Router();
const   auth    = require('../middleware/auth')

router.get('/userData', auth, (req, res) => {
    res.send({id: req.id})
})

function    solo_info(id, time, action)
{
    return new Promise((resolve, reject) => {
        const query = "SELECT `username`, `profile_img` FROM users INNER JOIN user_images on users.id where users.id = user_images.id AND users.id = ?"
        db.query(query, [id], (error, results) => {
            if (error) reject(error)
            else if (results) {
                let msgs = {
                    id: id,
                    profile_img: results[0].profile_img,
                    username: results[0].username,
                    time: time,
                    action: action
                }
                resolve(msgs) }
        })
    })
}

function    loadInfo(users)
{
    return new Promise((resolve, reject) => {
        
        if (users === 'no messages')
            resolve(users)
        else
        {
            let promises = []
            users.map((element) => {
                promises.push(solo_info(element.id, element.time, element.action))
            });
            Promise.all(promises)
            .then(results => resolve(results))
            .catch(error => reject(error))
        }
    })
}

function    seen_messages(id)
{
    return new Promise((resolve, reject) => {
        const msgQuery = "UPDATE `notifications` SET `seen` = 1 WHERE `message` = ?"
        db.query(msgQuery, [id], (error, results) => {
            if (error) reject(error)
            else if (results) resolve('done')
        })
    })
}

function    msgNotification(id)
{
    return new Promise((resolve, reject) => {
        const msgQuery = "SELECT `id`, `action`, `time` FROM notifications WHERE `message` = ? ORDER BY TIME DESC LIMIT 5"
        db.query(msgQuery, [id], (error, results) => {
            if (error) reject(error)
            else if (results.length == 0) resolve('no messages')
            else if (results.length > 0) resolve(results)
        })
    })
}

router.get('/msgNotification', auth, (req, res) => {

    seen_messages(req.id)
    .then(seen => msgNotification(req.id))
    .then(notif => loadInfo(notif))
    .then(results => res.send({status: "success", messages: results}))
    .catch(error => res.send({status: "failure", messages: error}))
})

function    NotificationGet(id, msg)
{
    return new Promise((resolve, reject) => {
        let notifQuery
        if (msg === "full")
            notifQuery = "SELECT `id`, `action`, `time` FROM notifications WHERE `visited` = ? OR `match` = ? OR `unlike` = ? OR `like` = ?  ORDER BY TIME DESC"
        else if (msg === "nav")
            notifQuery = "SELECT `id`, `action`, `time` FROM notifications WHERE `visited` = ? OR `match` = ? OR `unlike` = ? OR `like` = ? ORDER BY TIME DESC LIMIT 5"
        db.query(notifQuery, [id, id, id, id], (error, results) => {
            if (error) reject(error)
            else if (results.length == 0) resolve('no messages')
            else if (results.length > 0) resolve(results)
        })
    })
}

function    seen_notifications(id)
{
    return new Promise((resolve, reject) => {
        const msgQuery = "UPDATE `notifications` SET `seen` = 1 WHERE `visited` = ? OR `match` = ? OR `unlike` = ? OR `like` = ?"
        db.query(msgQuery, [id, id, id, id], (error, results) => {
            if (error) reject(error)
            else if (results) resolve('done')
        })
    })
}

router.post('/loadNotification', auth, (req, res) => {

    seen_notifications(req.id)
    .then(seen => NotificationGet(req.id, req.body.msg))
    .then(notif => loadInfo(notif))
    .then(results => res.send({status: "success", messages: results}))
    .catch(error => res.send({status: "failure", messages: error}))
})


router.get('/msgNotificationNum', auth, (req, res) => {
    const msgQuery = "SELECT COUNT(*) as number FROM notifications WHERE `message` = ? AND seen = 0"
        db.query(msgQuery, [req.id], (error, results) => {
            if (error) res.send({status: "failure", num: error})
            else if (results) res.send({status: "success", num: results[0]})
    })
})

router.get('/NotificationNum', auth, (req, res) => {
    const msgQuery = "SELECT COUNT(*) as number FROM notifications WHERE (`visited` = ? OR `match` = ? OR `unlike` = ? OR `like` = ?) AND seen = 0"
        db.query(msgQuery, [req.id, req.id, req.id, req.id], (error, results) => {
            if (error) res.send({status: "failure", num: error})
            else if (results) res.send({status: "success", num: results[0]})
    })
})

function    getList(id)
{
    return new Promise((resolve, reject) => {
        const histQuery = "SELECT `user1_id`, `user2_id` FROM `matches` WHERE (user1_id = ? OR user2_id = ?) AND `blocked` = 1 ORDER BY `id` DESC"
        db.query(histQuery, [id, id], (error, results) => {
            if (error) reject("histQueyr didn't deliver")
            else if (results.length == 0) resolve("Empty")
            else if (results.length > 0) resolve(results)
        })
    })
}

function    serveList(blockedId)
{
    return new Promise((resolve, reject) => {
        const histQuery = "SELECT `username`, `first_name`, `last_name`, `profile_img` FROM `users` INNER JOIN `user_images` ON users.id WHERE users.id = user_images.id AND users.id = ?"
        db.query(histQuery, [blockedId], (error, results) => {
            if (error) reject("histquery didn't dilver")
            else if (results.length == 1)
            {
                const list = {
                    username: results[0].username,
                    first_name: results[0].first_name,
                    last_name: results[0].last_name,
                    profile_img: results[0].profile_img,
                    id: blockedId
                }
                resolve(list)
            }
        })
    })  
}

function    getInfo(rows, id)
{
    return new Promise((resolve, reject) => {
        if (rows === "Empty")
            resolve(rows)
        else {
            let promises = []
            let   realId
            rows.map((element) => {
                if (element.user1_id === id)
                    realId = element.user2_id
                else
                    realId = element.user1_id
                promises.push(serveList(realId))
            })
        Promise.all(promises)
        .then(history => resolve(history))
        .catch(error => reject(error))
        }
    })     
}

router.get('/blockedList', auth, (req, res) => {
    getList(req.id)
    .then(result => getInfo(result, req.id))
    .then(finish => res.send(finish))
    .catch(error => res.send(error))
})

router.post('/removeBlock', auth, (req, res) => {
    let query = "Delete FROM `matches` WHERE `blocked` = 1 AND ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))"
    db.query(query, [req.body.blocked, req.id, req.id, req.body.blocked], (error, result) => {
        if (error) res.send(error)
        else if (result) res.send("done")
    })
})

module.exports = router;