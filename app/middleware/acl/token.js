'use strict';
const jwt = require('jsonwebtoken');
const utils = require('../../lib');

const validate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return utils.response.sendUnAuthorizedError(res, 'Unauthorized');
    }

    try {
        const token_verification = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = {
            id: token_verification.id,
        };
        next();
    } catch (err) {
        console.error('=> Validate Token [%s]', err.message);
        return utils.response.sendUnAuthorizedError(res, 'Unauthorized');
    }
};

const generate = (userId) => {
    return jwt.sign({ id: userId }, process.env.TOKEN_SECRET, {
        expiresIn: '2h',
    });
};

module.exports = {
    validate,
    generate,
};
