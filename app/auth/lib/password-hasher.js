'use strict';

const bcrypt = require('bcryptjs');

// Hash users password
const encryptPassword = async (plaintext) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plaintext, salt);

    return hashedPassword;
};

const comparePassword = async (plaintext, dbPassword) => {
    const isSame = await bcrypt.compare(plaintext, dbPassword);

    return isSame;
};

module.exports = { encryptPassword, comparePassword };
