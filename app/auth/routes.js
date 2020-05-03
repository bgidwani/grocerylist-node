'use strict';

const express = require('express');
const app = (module.exports = express.Router());

const auth = require('./auth');

app.route('/login').post(auth.login);

app.route('/users').get((req, res) => {
    res.send('List of all users');
});
