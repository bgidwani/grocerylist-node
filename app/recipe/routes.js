'use strict';

const express = require('express');
const app = (module.exports = express.Router());
const resHelper = require('../lib/responseHelper');

const list = require('./controller');

// Routes
app.route('/').get(list.getAll).post(resHelper.sendNotSupportedError);
