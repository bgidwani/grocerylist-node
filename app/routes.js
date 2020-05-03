'use strict';

const express = require('express');

//import routes
const authModule = require('./auth');

const router = express.Router();

// Login route
router.use('/', authModule.routes);

//Routes for home page
router.get('/', (req, res) => {
    res.send('<h1>Welcome to the site</h1>');
});

// handle the route generated in netlify
router.use('/.netlify/functions/server', router);

// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
router.use(function (req, res) {
    var message = '<h3 style=color:red>You seem to be lost. What are you trying to find here?</h3>';
    message += `<div><strong>Requested Url:</strong> ${req.originalUrl}</div>`;
    res.status(404).send(message);
});

module.exports = router;
