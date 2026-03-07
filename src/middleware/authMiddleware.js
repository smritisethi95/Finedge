const { verifyToken } = require('../utils/jwtHelper');
const { UnauthorizedError, TokenError } = require('../errors/authError');

const validateJWT = (req, res, next) => {
    try {
        const headers = req.headers || {};
        const authHeader = headers.authorization;
        const authToken = authHeader?.split(' ')[1];

        if(!authToken) {
            throw new UnauthorizedError();
        }

        const decodedToken = verifyToken(authToken);

        if(!decodedToken) {
            throw new TokenError();
        }

        // Attach user data to request
        req.user = decodedToken;

        next();

    } catch(error) {
        next(error);
    }
}


module.exports = { validateJWT };
