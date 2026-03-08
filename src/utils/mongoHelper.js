const mongoose = require('mongoose');

// Helper to convert userId to ObjectId if needed
const toObjectId = (userId) => {
    if (typeof userId === 'string') {
        return new mongoose.Types.ObjectId(userId);
    }
    return userId;
}


module.exports = { toObjectId };