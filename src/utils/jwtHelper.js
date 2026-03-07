const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "566HR+YfhfJ54H4R687486";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


/**
 * Generate JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    const { _id, email, name } = payload;
    
    console.log(payload)
    return jwt.sign(
        { 
            id: _id, 
            email, 
            name 
        }, 
        JWT_SECRET, 
        { 
            expiresIn: JWT_EXPIRES_IN 
        }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};
