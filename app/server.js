'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');
const utils = require('./lib');
const acl = require('./middleware/acl');

//initialize the server
const app = express();
const router = express.Router();

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);

//import routes
const authRoute = require('./auth/routes');
const listRoute = require('./lists/routes');

// Login routes
router.use('/users', authRoute);

// Grocery list routes
router.use('/list', acl.token.validate, listRoute);

//Routes for home page
router.get('/', (req, res) => {
    utils.response.sendSuccessText(res, '<h1>Welcome to the site</h1>');
});

app.use(
    cors({
        origin: '*',
    })
);

// handle the route generated in netlify
app.use('/.netlify/functions/server', router);
app.use('/', router);

// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
app.use(function (req, res) {
    var message =
        '<h3 style=color:red>You seem to be lost. What are you trying to find here?</h3>';
    message += `<div><strong>Requested Url:</strong> ${req.originalUrl}</div>`;

    utils.response.sendNotFoundText(res, message);
});

module.exports = app;
module.exports.handler = serverless(app);
