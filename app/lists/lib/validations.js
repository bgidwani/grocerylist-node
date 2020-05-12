'use strict';

const Joi = require('@hapi/joi');

// Validate input data
const validateCreate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().min(4),
        items: Joi.array(),
    });

    return schema.validate(data);
};

module.exports = {
    validateCreate,
};
