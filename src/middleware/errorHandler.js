// const errorHandler = (err, req, res, next) => {
//     const statusCode = err.statusCode || 500;

//     return res.status(statusCode).json({
//         message: err.message,
//         stack: err.stack
//     });
// }

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
    const payload = { success: false, error: err.message || 'Internal Server Error' };
    if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
    return res.status(statusCode).json(payload);
};

module.exports = errorHandler;
