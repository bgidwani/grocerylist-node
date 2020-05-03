'use strict';

const Joi = require('@hapi/joi');

const emailValidation = Joi.string().required().min(6).email();
const passwordValidation = Joi.string().required().min(6);

// Validate input data before signup
const validateSignup = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().min(6).required(),
        email: emailValidation,
        password: passwordValidation,
    });

    return schema.validate(data);
};

const validateLogin = (data) => {
    const schema = Joi.object({
        email: emailValidation,
        password: passwordValidation,
    });

    return schema.validate(data);
};

module.exports = {
    validateSignup,
    validateLogin,
};
