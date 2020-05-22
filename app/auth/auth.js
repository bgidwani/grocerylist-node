'use strict';

const utils = require('../lib');
const acl = require('../middleware/acl');

const { validateSignup, validateLogin } = require('./lib/validations');
const { encryptPassword, comparePassword } = require('./lib/password-hasher');

const User = require('../models/User');

const executeAndRespond = async (res, callback) => {
    var message = await utils.db.executeWithDbContext(callback);

    if (message !== true) {
        return utils.response.sendInternalError(res, message);
    }
};

// Signup user
const signup = async (req, res) => {
    const { error } = validateSignup(req.body);
    if (error) {
        return utils.response.sendBadRequest(res, error.details[0].message);
    }

    const encryptedPassword = await encryptPassword(req.body.password);

    return await executeAndRespond(res, async () => {
        const reqemail = req.body.email.toLowerCase();

        const dbuser = await User.findOne({ email: reqemail });
        const user = new User({
            name: req.body.name,
            email: reqemail,
            password: encryptedPassword,
        });

        if (dbuser === null) {
            await user.save();

            utils.response.sendjson(
                res,
                utils.response.HTTP_STATUS_CODES.CREATED,
                {
                    message: 'User Registered',
                    user: user._id,
                }
            );
        } else {
            utils.response.sendBadRequest(res, 'Duplicate user');
        }
    });
};

// Login
const login = async (req, res) => {
    const logindata = req.body;
    const { error } = validateLogin(logindata);
    if (error) {
        return utils.response.sendBadRequest(res, error.details[0].message);
    }

    //convert the email to lower case to ensure case insensitive search
    logindata.email = logindata.email.toLowerCase();
    return await executeAndRespond(res, async () => {
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

        //track login
        await utils.logger.track('login', user._id);

        //generate and return a new token
        var token = acl.token.generate(user._id);
        var data = {
            token: token,
            message: 'Login success',
        };
        return utils.response.sendSuccess(res, data);
    });
};

module.exports = {
    signup,
    login,
};
