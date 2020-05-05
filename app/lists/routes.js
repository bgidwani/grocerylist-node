'use strict';

const express = require('express');
const app = (module.exports = express.Router());
const listmiddleware = require('../middleware/param/grocerylist');

const list = require('./controller');

// extract listId parameter, if available in the request
app.param('listId', listmiddleware.getParam);

// Routes
app.route('/').get(list.getAll).post(list.create);

app.route('/:listId').get(list.retrieve.byID);
