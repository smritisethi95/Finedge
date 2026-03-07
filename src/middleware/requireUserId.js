const mongoose = require('mongoose');

function requireUserId(req, res, next) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(400).json({ error: "Missing 'x-user-id' header." });
    }
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid 'x-user-id' header. Must be a valid MongoDB ObjectId." });
    }
    // Optionally attach parsed ObjectId for downstream use
    req.userId = userId;
    next();
}

module.exports = requireUserId;