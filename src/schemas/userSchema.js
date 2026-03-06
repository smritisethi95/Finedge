const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi
    .string()
    .alphanum()
    .trim()
    .min(3)
    .max(30)
    .required()
    .messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be atleast 3 characters long',
        'string.max': 'Name cannot be more than 30 characters',
        'any.required': 'Name is required'
    }),
    email: Joi
    .string()
    .trim()
    .email()
    .required()
    .messages({
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi
    .string()
    .min(8)
    .max(30)
    .required()
    .messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be atleast 8 characters long',
        'string.max': 'Password cannot be more than 30 characters',
        'any.required': 'Password is required'
    }),
});

const loginSchema = Joi.object({
    email: Joi
    .string()
    .trim()
    .email()
    .required()
    .messages({
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi
    .string()
    .min(8)
    .required()
    .messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be atleast 8 characters long',
        'any.required': 'Password is required'
    }),
});


module.exports = { registerSchema, loginSchema };