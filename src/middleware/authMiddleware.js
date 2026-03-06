const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const userService = require('../services/userService');
const { UnauthorizedError, TokenError } = require('../errors/authError');

const validateJWT = (req, res, next) => {
    try {
        const headers = req.headers || {};
        const authHeader = headers.authorization;
        const authToken = authHeader?.split(' ')[1];

        if(!authToken) {
            throw new UnauthorizedError();
        }

        const decodedToken = jwt.verify(authToken, JWT_SECRET);

        if(!decodedToken) {
            throw new TokenError();
        }

        // const user = userService.getUserById(decodedToken.id);
        // req.user = user;

        next();

    } catch(error) {
        next(error);
    }
}


module.exports = { validateJWT };
