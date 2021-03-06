'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const cors = require('cors');
const utils = require('./lib');
const acl = require('./middleware/acl');
const uuid = require('uuid');

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
const recipeRoute = require('./recipe/routes');

app.use(
    cors({
        origin: '*',
    })
);

app.use(function (req, res, next) {
    req.id = uuid.v4();
    next();
});

/// ================================================ ///
///               Route definitions
/// ================================================ ///
// Login routes
router.use('/users', authRoute);

// Grocery list routes
router.use('/list', acl.token.validate, listRoute);

// Recipe routes
router.use('/recipes', acl.token.validate, recipeRoute);

//Routes for home page
router.get('/', (req, res) => {
    utils.response.sendSuccessText(res, '<h1>Welcome to the site</h1>');
});

// handle the route generated in netlify
app.use('/.netlify/functions/server', router);
app.use('/', router);

/// ================================================ ///

/// ================================================ ///
///               Error Handling
/// ================================================ ///

// catch 404 and forward to error handler
// note this is after all good routes and is not an error handler
// to get a 404, it has to fall through to this route - no error involved
app.use(function (req, res) {
    //console.log('Inside error handling');
    var message =
        '<h3 style=color:red>You seem to be lost. What are you trying to find here?</h3>';
    message += `<div><strong>Requested Url:</strong> ${req.originalUrl}</div>`;

    return utils.response.sendNotFoundText(res, message);
});
/// ================================================ ///

module.exports = app;
module.exports.handler = serverless(app);
