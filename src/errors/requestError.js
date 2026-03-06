const BaseError = require('./baseError');

class InvalidRequestParamsError extends BaseError {
    constructor(message = 'Invalid Request Parameters') {
        super(message, 400);
    }
}


module.exports = { InvalidRequestParamsError };