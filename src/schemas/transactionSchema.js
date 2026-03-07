const Joi = require('joi');

const transactionCreateSchema = Joi.object({
    type: Joi.string().valid('income', 'expense').required()
        .messages({
            'any.required': "'type' is required",
            'any.only': "'type' must be either 'income' or 'expense'"
        }),
    category: Joi.string().trim().min(1).required()
        .messages({
            'string.empty': "'category' cannot be empty",
            'any.required': "'category' is required"
        }),
    amount: Joi.number().min(0).required()
        .messages({
            'number.base': "'amount' must be a number",
            'number.min': "'amount' must be >= 0",
            'any.required': "'amount' is required"
        }),
    date: Joi.date().iso().optional()
        .messages({
            'date.base': "'date' must be a valid date",
            'date.format': "'date' must be in ISO format"
        })
});

const transactionUpdateSchema = Joi.object({
    type: Joi.string().valid('income', 'expense')
        .messages({ 'any.only': "'type' must be either 'income' or 'expense'" }),
    category: Joi.string().trim().min(1)
        .messages({ 'string.empty': "'category' cannot be empty" }),
    amount: Joi.number().min(0)
        .messages({ 'number.base': "'amount' must be a number", 'number.min': "'amount' must be >= 0" }),
    date: Joi.date().iso()
        .messages({ 'date.base': "'date' must be a valid date", 'date.format': "'date' must be in ISO format" })
})
.min(1) // require at least one field for PATCH
.messages({ 'object.min': 'At least one field must be provided for update.' });

module.exports = {
    transactionCreateSchema,
    transactionUpdateSchema
};