const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const validateJWT = (req, res, next) => {
    try {
        const headers = req.headers || {};
        const authHeader = headers.authorization;
        const authToken = authHeader?.split(' ')[1];

        if(!authToken) {
            throw new Error();
        }

        const decodedToken = jwt.verify(authToken, JWT_SECRET);

        if(!decodedToken) {
            throw new Error();
        }

        // TODO: Find and attach User to request

        next();

    } catch(error) {
        next(error);
    }
}


module.exports = { validateJWT };
