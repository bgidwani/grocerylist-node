'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    items: [
        {
            name: {
                type: String,
                required: true,
                min: 2,
                max: 255,
            },
            quantity: {
                type: Number,
                default: 1,
            },
            bought: {
                type: Boolean,
                default: false,
            },
        },
    ],
    createDate: {
        type: Date,
        default: Date.now,
    },
    updateDate: {
        type: Date,
    },
});

module.exports = mongoose.model('GroceryList', listSchema);
