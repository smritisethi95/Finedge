const Joi = require('joi');

const budgetSchema = Joi.object({
    monthlyGoal: Joi
    .number()
    .positive()
    .required()
    .messages({
        "number.base": "Monthly goal must be a number",
        "number.positive": "Monthly goal must be greater than 0",
        "any.required": "Monthly goal is required"
    }),
    savingsTarget: Joi
    .number()
    .min(0)
    .required()
    .messages({
        "number.base": "Savings target must be a number",
        "number.min": "Savings target cannot be negative",
        "any.required": "Savings target is required"
    })
});


module.exports = { budgetSchema };