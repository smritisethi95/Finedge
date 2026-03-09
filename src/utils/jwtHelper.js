const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Debug: Check if JWT_SECRET is loaded
if (!JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET is not defined in environment variables!');
    console.error('Make sure your .env file has JWT_SECRET set and server is restarted.');
}

/**
 * Generate JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    const { _id, email, name } = payload;
    
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET in your .env file.');
    }
    
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
