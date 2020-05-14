'use strict';

const Joi = require('@hapi/joi');

const nameValidation = Joi.string().required().min(4);

// Validate input data
const validateList = (data) => {
    const schema = Joi.object({
        name: nameValidation,
        items: Joi.array(),
        updateDate: Joi.date().optional(),
    });

    return schema.validate(data);
};

const validateName = (name) => {
    return nameValidation.validate(name);
};

module.exports = {
    validateList,
    validateName,
};
