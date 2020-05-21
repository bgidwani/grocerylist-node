'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventlogSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    requestId: {
        type: String,
    },
    data: {
        type: Schema.Types.Mixed,
    },
    timestamp: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model('EventLog', eventlogSchema);
