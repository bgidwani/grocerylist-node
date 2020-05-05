'use strict';

const express = require('express');
const resHelper = require('../lib/responseHelper');
const app = (module.exports = express.Router());

const auth = require('./auth');

app.route('/login').post(auth.login).get(resHelper.sendNotSupportedError);

app.route('/')
    .get(resHelper.sendNotSupportedError)
    .post(resHelper.sendNotSupportedError);
