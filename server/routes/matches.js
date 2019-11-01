const   express = require('express');
const   router  = express.Router();
const   auth    = require('../middleware/auth')
const   geolib  = require('geolib');

router.post('/userPref', auth, async (req, res) => {
    id = req.id
    const   query = "UPDATE user_pref SET `ageGap` = ?, `distance` = ?, `fameGap` = ?, `tagNumber` = ? WHERE id = ?"
    await db.query(query, [req.body.ageGap, req.body.distance, req.body.fameGap, req.body.tagNumber, id], (error, results) => {
        if (error) res.send("error when changing prefrences")
        else if (results) res.send("prefrences were changed")
    })
})

function    get_userPref(id)
{
    return new Promise((resolve, reject) => {
        prefQuery = "SELECT * FROM user_pref INNER JOIN user_data ON user_pref.id where user_pref.id = ? AND user_pref.id = user_data.id"
        db.query(prefQuery, [id], (error, results) => {
            if (error) reject("prefQuery didn't deliver")
            else if (results)
                resolve(results[0])
        })
    })
}

function    tags_compare(tags1, tags2)
{
    var tab1 = tags1.split(",");
    var tab2 = tags2.split(",");

    var i;
    var j;
    var counter = 0;
    for (i = 0; i < 5; i++)
    {
        for(j = 0; j < 5; j++)
        {
            if (tab1[i] === tab2[j])
            counter++;
        }
    }
    return (counter);
}

function    sort_byDistance(userPref, matches)
{
    matches.sort(function(a, b) {
        return (geolib.getPreciseDistance(
            {latitude: userPref.latitude, longitude: userPref.longitude},
            {latitude: a.latitude, longitude: a.longitude})
            - geolib.getPreciseDistance(
            {latitude: userPref.latitude, longitude: userPref.longitude},
            {latitude: b.latitude, longitude: b.longitude}))
    })
}

function    sort_byAge(userPref, matches)
{
    matches.sort(function(a, b) {
        return ((userPref.age - b.age) - (userPref.age - a.age)) 
    })
}

function    sort_byFame(userPref, matches)
{
    matches.sort(function(a, b) {
        return ((userPref.fame - b.fame) - (userPref.fame - a.fame)) 
    })
}

function    sort_byTags(userPref, matches)
{
    matches.sort(function(a, b) {
        return (tags_compare(userPref.tags, b.tags) - tags_compare(userPref.tags, a.tags)) 
    })
}

function    filter_matches(userPref, users)
{
    return new Promise((resolve, reject) => {
        var i;
        var matches = [];
        for(i = 0; i < users.length; i++)
        {
            var distance = geolib.getPreciseDistance(
                {latitude: userPref.latitude, longitude: userPref.longitude},
                {latitude: users[i].latitude, longitude: users[i].longitude},
            )
            if (userPref.otherGender == users[i].myGender || userPref.otherGender == 'Other')
            if ((userPref.distance * 1000) >= distance)
            {
                if ((userPref.age + userPref.ageGap) > users[i].age && (userPref.age - userPref.ageGap) < users[i].age)
                {
                    if (tags_compare(userPref.tags, users[i].tags) >= userPref.tagNumber)
                    {
                        if ((userPref.fame + userPref.fameGap) >= users[i].fame && (userPref.fame - userPref.fameGap) <= users[i].fame)
                        {
                            if (userPref.id != users[i].id)
                            {
                                let suggestion = {
                                    id: users[i].id,
                                    username: users[i].username,
                                    profile_img: users[i].profile_img,
                                    bio: users[i].bio,
                                    age: users[i].age,
                                    fame: users[i].fame,
                                    tags: users[i].tags,
                                    latitude: users[i].latitude,
                                    longitude: users[i].longitude,
                                    distance: (geolib.getPreciseDistance(
                                        {latitude: userPref.latitude, longitude: userPref.longitude},
                                        {latitude: users[i].latitude, longitude: users[i].longitude},) / 1000)
                                }
                                matches.push(suggestion);
                            }
                        }
                    }
                    
                }
                   
            }               
        }
        if (matches.length == 0)
            reject("no matches found");
        else if (matches.length > 0)
        {
            sort_byDistance(userPref, matches)
            resolve(matches)
        }
    })
}

function    resolveM_B(match, userid)
{
    return new Promise((resolve, reject) => {
        const filterQuery = "SELECT * FROM `matches` WHERE (matched = 1 || blocked = 1) AND ((user1_id = ? AND user2_id = ?) || (user1_id = ? AND user2_id = ?))"
        db.query(filterQuery, [userid, match.id, match.id, userid], (error, results) => {
            if (error) reject("filterquery didn't dilver")
            else if (results.length == 1)
            {
                resolve("history")
            }
            else if (results.length == 0)
            {
                resolve(match)
            }
        })
    })   
}

function    removeM_B(allMatches, userid)
{
    return new Promise((resolve, reject) => {
        if (allMatches === "no matches found")
            resolve("no matches found")
        let promises = []
        allMatches.map((match) => {
            promises.push(resolveM_B(match, userid)) 
        })
        Promise.all(promises)
        .then(frech => 
        {
            frech = frech.filter(word => word != "history")
            if (frech.length > 0)
                resolve(frech)
            else
                resolve("no matches found")
        })
        .catch(error => reject(error))
    })
}

function    find_matches(userPref)
{
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM users INNER JOIN user_data INNER JOIN user_images INNER JOIN user_pref ON users.id where users.id = user_data.id AND users.id = user_images.id AND users.id = user_pref.id"
        db.query(query, [], (error, results) => {
            if (error) reject(error)
            else if (results)
            {
                filter_matches(userPref, results)
                .then(all_matches => removeM_B(all_matches, userPref.id))
                .then(matches => resolve(matches))
                .catch(error => reject(error))
            }
        })
    })
}

router.get('/loadMatches', auth, (req, res) => {
    get_userPref(req.id)
    .then(userPref => find_matches(userPref))
    .then(matches => res.send(matches))
    .catch(error => res.send(error))
})

router.post('/sortByAge', auth, (req, res) => {
    if (req.body.length > 1)
    {
        prefQuery = "SELECT * FROM user_pref INNER JOIN user_data ON user_pref.id where user_pref.id = ? AND user_pref.id = user_data.id"
        db.query(prefQuery, [req.id], (error, results) => {
            if (error) res.send({status: "failure"})
            else if (results) {
                var choices = req.body
                sort_byAge(results[0], choices)
                res.send({status: "success", choices: choices})
            }
        })
    }
})

router.post('/sortByDistance', auth, (req, res) => {
    if (req.body.length > 1)
    {
        prefQuery = "SELECT * FROM user_pref INNER JOIN user_data ON user_pref.id where user_pref.id = ? AND user_pref.id = user_data.id"
        db.query(prefQuery, [req.id], (error, results) => {
            if (error) res.send({status: "failure"})
            else if (results) {
                var choices = req.body
                sort_byDistance(results[0], choices)
                res.send({status: "success", choices: choices})
            }
        })
    }
})

router.post('/sortByTags', auth, (req, res) => {
    if (req.body.length > 1)
    {
        prefQuery = "SELECT * FROM user_pref INNER JOIN user_data ON user_pref.id where user_pref.id = ? AND user_pref.id = user_data.id"
        db.query(prefQuery, [req.id], (error, results) => {
            if (error) res.send({status: "failure"})
            else if (results) {
                var choices = req.body
                sort_byTags(results[0], choices)
                res.send({status: "success", choices: choices})
            }
        })
    }
})

router.post('/sortByFame', auth, (req, res) => {
    if (req.body.length > 1)
    {
        prefQuery = "SELECT * FROM user_pref INNER JOIN user_data ON user_pref.id where user_pref.id = ? AND user_pref.id = user_data.id"
        db.query(prefQuery, [req.id], (error, results) => {
            if (error) res.send({status: "failure"})
            else if (results) {
                var choices = req.body
                sort_byFame(results[0], choices)
                res.send({status: "success", choices: choices})
            }
        })
    }
})

router.get('/loadPref', auth, async (req, res) => {
    const query = "SELECT `ageGap`, `distance`, `fameGap`, `tagNumber` FROM user_pref where id = ?"
    await db.query(query, [req.id], (error, results) => {
        if (error) res.send("prefQuery didn't deliver")
        else if (results) res.send(results[0])
    })
})

function    matchOrNot(userId, likedId)
{
    return new Promise((resolve, reject) => {
        const matchquery = "SELECT * FROM matches where `matched` = 1 AND ((`user1_id` = ? AND `user2_id` = ?) OR (`user1_id` = ? AND `user2_id` = ?))"
        db.query(matchquery, [likedId, userId, userId, likedId], (error, results) => {
            if (error) reject("prefQuery didn't deliver")
            else if (results.length == 1) resolve("match!")
            else if (results.length == 0) resolve("nop")
        })
    })
}

function    removeLike(userId, likedId, msg)
{
    return new Promise((resolve, reject) => {
        if (msg == "match!")
        {
            const loveQuery = "UPDATE `matches` SET `matched` = 0 WHERE ((`user1_id` = ? AND `user2_id` = ?) OR (`user1_id` = ? AND `user2_id` = ?))"
            db.query(loveQuery, [likedId, userId, userId, likedId], (error, results) => {
                if (error) reject("love query didn't deliver")
                else if (results) resolve("divorced")
            })
        }
        else if (msg == "nop")
        {
            const query = "SELECT * FROM matches where `matched` = 0 AND `user1_id` = ? AND `user2_id` = ?"
            db.query(query, [likedId, userId], (error, results) => {
            if (error) reject("removeQuery didn't deliver")
            else if (results.length == 1) resolve("match!")
            else if (results.length == 0) resolve("nop")
        })
        }
    })
}

function    addNotification(type, id_from, id_to)
{
    return new Promise((resolve, reject) => {
        const notifQuery = "INSERT INTO `notifications` (`id`, `" + type +"`, action) VALUES (?, ?, ?)"
        db.query(notifQuery, [id_from, id_to, type], (error, results) => {
            if (error) reject("historyQuery didn't dilver")
            else if (results) 
            {
                resolve("history added")
            }
        })
    })
}

function    add_remove(userId, likedId, msg)
{
    return new Promise((resolve, reject) => {
        if (msg === "divorced")
            resolve(msg)
        else if (msg === "nop")
        {
            const query = "SELECT * FROM matches where `matched` = 0 AND `user1_id` = ? AND `user2_id` = ?"
            db.query(query, [userId, likedId], (error, results) => {
            if (error) reject("removeQuery didn't deliver")
            else if (results.length == 1)
            {
                const query = "DELETE FROM `matches` WHERE `user1_id` = ? AND `user2_id` = ?"
                db.query(query, [userId, likedId], (error, results) => {
                if (error) reject("removeQuery didn't deliver")
                else if (results) 
                {
                    addNotification("unlike", userId, likedId)
                    .then(done => resolve("unlike"))
                    .catch(error => reject(error))
                }
            })
            }
            else if (results.length == 0)
            {
                const loveQuery = "INSERT INTO matches (`user1_id`, `user2_id`) VALUES (?, ?)"
                db.query(loveQuery, [userId, likedId], (error, results) => {
                    if (error) reject("love query 2 didn't deliver")
                    else if (results) 
                    {
                        addNotification("like", userId, likedId)
                        .then(done => resolve("like"))
                        .catch(error => reject(error))
                    }
                })
            }})
        }
        else if (msg === "match!")
        {
            const query = "UPDATE `matches` SET `matched` = 1 WHERE `user1_id` = ? AND `user2_id` = ?"
            db.query(query, [likedId, userId], (error, results) => {
            if (error) reject("removeQuery didn't deliver")
            else if (results) 
            {
                addNotification("match", userId, likedId)
                .then(done => resolve("mbrok"))
                .catch(error => reject(error))
            }
            })
        }
    })
}

function    adjust_fame(id, action)
{
    return new Promise((resolve, reject) => {
        let i;
        if (action === "like")
            i = 0.5
        else if (action === "unlike")
            i = -0.5
        else if (action === "mbrok")
            i = 1
        else if (action === "divorced")
            i = -1
        else
            i = 0
        let query = "UPDATE `user_data` SET `fame` = `fame` + ? WHERE (`fame` + ?) BETWEEN 0 AND 4 AND id = ?"
        db.query(query, [i, i, id], (error, results) => {
            if (error) reject(error)
            else if (results) resolve(action)
        })
    })
}

function checkCondition(id)
{
    return new Promise((resolve, reject) => {
        let checkQury = "SELECT `image_count` FROM `user_images` WHERE id = ?"
        db.query(checkQury, [id], (error, results) => {
            if (error) reject(error)
            else if (results.length == 1 && results[0].image_count > 0) resolve("good to go")
            else if (results.length == 1 && results[0].image_count == 0) reject("zero")
            else reject("something went wrong")
        })
    })
}

router.post('/profileLike', auth, (req, res) => {

    checkCondition(req.id)
    .then(check => matchOrNot(req.id, req.body.likedId))
    .then(msg => removeLike(req.id, req.body.likedId, msg))
    .then(answer => add_remove(req.id, req.body.likedId, answer))
    .then(fame => adjust_fame(req.body.likedId, fame))
    .then(finish => 
    {
        req.io.emit('first_Notifications', {id_to: req.body.likedId})
        res.send(finish)
    })
    .catch(error => res.send(error))
})

function    blockUser(userId, removedId)
{
    return new Promise((resolve, reject) => {
            const removeQuery = "SELECT * FROM `matches` WHERE blocked = 0 AND ((user1_id = ? AND user2_id = ?) || (user1_id = ? AND user2_id = ?))"
            db.query(removeQuery, [removedId, userId, userId, removedId], (error, results) => {
                if (error) reject("removequery didn't deliver")
                else if (results.length == 1) resolve("block")
                else if (results.length == 0) resolve("add")
            })
    })
}

function    addBlock(userId, removedId, msg)
{
    return new Promise((resolve, reject) => {
        
        if (msg === "block")
        {
            const removeQuery = "UPDATE `matches` SET `blocked` = ?, `matched` = ? WHERE ((user1_id = ? AND user2_id = ?) || (user1_id = ? AND user2_id = ?))"
                db.query(removeQuery, [1, 0, userId, removedId, removedId, userId], (error, results) => {
                    if (error) reject("removequery didn't deliver")
                    else if (results) resolve("blocked")
            })
        }
        else if (msg === "add")
        {
            const addQuery = "INSERT INTO matches (`user1_id`, `user2_id`, `blocked`) VALUES (?, ?, ?)"
            db.query(addQuery, [userId, removedId, 1], (error, results) => {
                    if (error) reject("addquery 2 didn't deliver")
                    else if (results) resolve("blocked")
            })
        }
    })
}

router.post('/blockUser', auth, (req, res) => {
    blockUser(req.id, req.body.removedId)
    .then(msg => addBlock(req.id, req.body.removedId, msg))
    .then(fame => adjust_fame(req.body.removedId, req.body.status))
    .then(finish => res.send("blocked"))
    .catch(error => res.send(error))
})

function    user1_matches(id)
{
    return new Promise((resolve, reject) => {
        const query = "SELECT `user2_id` FROM matches where `user1_id` = ? AND `matched` = 1"
        db.query(query, [id], (error, results) => {
            if (error) reject("seaarchQuery didn't deliver")
            else if (results.length == 0) resolve("no left matches")
            else if (results.length > 0) resolve(results)
        })
    })
}

function    user2_matches(id, left)
{
    return new Promise((resolve, reject) => {
        const query = "SELECT `user1_id` FROM matches where `user2_id` = ? AND `matched` = 1"
        db.query(query, [id], (error, results) => {
            if (error) reject("seaarchQuery didn't deliver")
            else if (results.length == 0) 
            {
                if (left == "no left matches")
                    resolve("no matches")
                else
                    resolve(left)
            }
            else if (results.length > 0){
                if (left == "no left matches")
                    resolve(results)
                else
                    resolve(left.concat(results))
            }
        })
    })
}

function    serveMatches(finish)
{
    return new Promise(async (resolve, reject) => {
        const query = "SELECT * FROM users INNER JOIN user_data INNER JOIN user_images where users.id = user_data.id AND users.id = user_images.id AND users.id = ?"
            await db.query(query, [finish], (error, results) => {
                if (error) reject("lastquery didn't deliver")
                else if (results.length == 1)
                {
                    const info = {
                        username: results[0].username,
                        bio: results[0].bio,
                        age: results[0].age,
                        img: results[0].profile_img,
                        id: results[0].id,
                        online: results[0].online
                    }
                    resolve(info)
                }
            })
        })
}

function    deliverMatches(matchIds)
{
    return new Promise((resolve, reject) => {
        if (matchIds === "no matches")
            resolve("No matches")
        else {
            let finish = []
            const promises = []
            matchIds.forEach(element => {
                if (element.user1_id != undefined)
                    finish.push(element.user1_id)
                if (element.user2_id != undefined)
                    finish.push(element.user2_id)
            });
        finish.map((id) => {
            promises.push(serveMatches(id)) 
        })
        Promise.all(promises)
        .then(serving => resolve(serving))
        .catch(error => reject(error))
        }
    })
}

router.get('/oldMatches', auth, (req, res) => {
    user1_matches(req.id)
    .then(left_matchs => user2_matches(req.id, left_matchs))
    .then(matchIds => deliverMatches(matchIds))
    .then(finish => res.send({status: "success", matches: finish}))
    .catch(error => res.send({status: "failure", matches: error}))
})

module.exports = router;