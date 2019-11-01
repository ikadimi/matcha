const   express = require('express');
const   router  = express.Router();
const   auth    = require('../middleware/auth')


function    getHistory(id)
{
    return new Promise((resolve, reject) => {
        const histQuery = "SELECT `id`, `visited`, `time` FROM `notifications` WHERE id = ? AND `visited` != ? ORDER BY TIME DESC"
        db.query(histQuery, [id, -1], (error, results) => {
            if (error) reject("histQueyr didn't deliver")
            else if (results.length == 0) resolve("Empty")
            else if (results.length > 0) resolve(results)
        })
    })
}

function    serverHistory(visitedId, visitTime)
{
    return new Promise((resolve, reject) => {
        const histQuery = "SELECT `username`, `profile_img` FROM `users` INNER JOIN `user_images` ON users.id WHERE users.id = user_images.id AND users.id = ?"
        db.query(histQuery, [visitedId], (error, results) => {
            if (error) reject("histquery didn't dilver")
            else if (results.length == 1)
            {
                const hist = {
                    username: results[0].username,
                    profile_img: results[0].profile_img,
                    time: visitTime,
                    id: visitedId
                }
                resolve(hist)
            }
        })
    })  
}

function    getInfo(rows)
{
    return new Promise((resolve, reject) => {
        if (rows === "Empty")
            resolve(rows)
        else {
            const promises = []
            rows.map((element) => {
                promises.push(serverHistory(element.visited, element.time)) 
            })
        Promise.all(promises)
        .then(history => resolve(history))
        .catch(error => reject(error))
        }
    })     
}

router.get('/loadHistory', auth, async (req, res) => {
    getHistory(req.id)
    .then(result => getInfo(result))
    .then(finish => res.send(finish))
    .catch(error => res.send(error))
})

module.exports = router;