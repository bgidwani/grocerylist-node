'use strict';

const utils = require('../lib');
const acl = require('../middleware/acl');

const { validateLogin } = require('./lib/validations');
const { comparePassword } = require('./lib/password-hasher');

const User = require('../models/User');

// Login
const login = async (req, res) => {
    const logindata = req.body;
    const { error } = validateLogin(logindata);
    if (error) {
        return utils.response.sendBadRequest(res, error.details[0].message);
    }

    try {
        await utils.db.executeWithDbContext(async () => {
            const user = await User.findOne({ email: logindata.email });
            if (!user) {
                return utils.response.sendNotFound(res, 'Invalid user');
            }

            const isvalidPassword = await comparePassword(
                logindata.password,
                user.password
            );

            if (!isvalidPassword) {
                return utils.response.sendNotFound(res, 'Invalid credentials');
            }

            //generate and return a new token
            var token = acl.token.generate(user._id);
            var data = {
                token: token,
                message: 'Login success',
            };
            return utils.response.sendSuccess(res, data);
        });
    } catch (err) {
        console.error('=> Login [%s]', err.message);
        return utils.response.sendInternalError(res, err.message);
    }
};

module.exports = {
    login,
};
