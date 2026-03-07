const BaseError = require('./baseError');

class EntityNotFoundError extends BaseError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}


module.exports = EntityNotFoundError;