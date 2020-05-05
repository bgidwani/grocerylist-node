'use strict';

const mongoose = require('mongoose');

const listSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    items: [
        {
            name: {
                type: String,
                required: true,
                min: 2,
                max: 255,
            },
            addDate: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('GroceryList', listSchema);
