const getUserIdFromReq = (req) => {
    return req.userId || (req.user && (req.user.id || req.user.userId || req.user.sub)) || null;
};


module.exports = { getUserIdFromReq };