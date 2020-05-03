'use strict';

const { validateLogin } = require('./lib/validations');

// Login
const login = async (req, res) => {
    const logindata = req.body;
    const { error } = validateLogin(logindata);
    if (error) {
        return res.status(400)
                  .json({
                      status: 400,
                      error: error.details[0].message
                  });
    }

    res.status(200).json({
        message: 'Success',
    });
};

module.exports = {
    login,
};
