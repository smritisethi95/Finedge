const { InvalidRequestParamsError } = require('../errors/requestError');

const validateRequest = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if(error) {
        const allErrorsInString = error.details.map(detail => detail.message).join('\\n');
        throw new InvalidRequestParamsError(allErrorsInString);
    } else {
        next();
    }
}


module.exports = { validateRequest };