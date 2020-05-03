'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const serverless = require('serverless-http');

//initialize the server
const app = express();

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);

// routes
app.use('/', routes);

module.exports = app;
module.exports.handler = serverless(app);
