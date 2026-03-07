const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] Method: ${req.method} URL: ${req.url}`);
    console.log(`Body: ${req.body}`);
    next();
}


module.exports = { requestLogger };