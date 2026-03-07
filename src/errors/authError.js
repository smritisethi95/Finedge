const BaseError = require('./baseError');

class TokenError extends BaseError {
    constructor() {
        super("Invalid Token", 401);
    }
};

class UnauthorizedError extends BaseError {
    constructor() {
        super("User is unauthorized", 401);
    }
};

class ForbiddenError extends BaseError {
    constructor() {
        super("User access denied", 403);
    }
};

class LoginError extends BaseError {
    constructor() {
        super("Invalid Email or Password", 401);
    }
};

class DuplicateUserError extends BaseError {
    constructor() {
        super("User already exists", 401);
    }
}


module.exports = { TokenError, UnauthorizedError, ForbiddenError, LoginError, DuplicateUserError };