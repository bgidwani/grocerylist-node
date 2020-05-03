'use strict';

const express = require('express');
const app = (module.exports = express.Router());

const auth = require('./auth');

app.route('/login')
   .options((req, res) => { res.status(200) })
   .post(auth.login)
   .get((req, res) => { res.status(401).send('Not supported') });

app.route('/').get((req, res) => {
    res.send('List of all users');
});
