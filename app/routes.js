'use strict';

const express = require('express');

//import routes
const authModule = require('./auth');

const app = (module.exports = express.Router());

// Login route
app.use('/', authModule.routes);

//Routes for home page
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the site</h1>');
});

// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
app.use(function (req, res) {
    res.status(404).send('<h3 style=color:red>You seem to be lost. What are you trying to find here?<h3>');
});
