const   jwt = require('jsonwebtoken');

module.exports = function  (req, res, next) {
    const   token = req.header('x-auth-token');

    if (!token) return res.send("No token provided")
    try {
        const decoded = jwt.verify(token, "jwtPrivateKey")
        req.id = decoded.id;
        next();
    } catch (ex) {
        res.send('Invalid token.');
    }
}