'use strict';

const db = require('./db');
const Event = require('../models/Event');

const trackEvent = async (type, userid, reqId, data) => {
    let event = new Event({
        type: type,
        user: userid,
        requestId: reqId,
        data: data,
        timeStamp: Date.now(),
    });

    await event.save();
};

const track = async (type, userid, reqId, data) => {
    let connectioninitiated = false;
    if (!db.isConnected) {
        await db.connectDb();
        connectioninitiated = true;
    }

    await trackEvent(type, userid, reqId, data);

    if (connectioninitiated) {
        await db.disconnectDb();
    }
};

const userId = (req) => req.user.id;
const requestId = (req) => req.id;

const trackUserAction = async (req, type, data) => {
    await track(type, userId(req), requestId(req), data);
};

const trackRecipeSearch = (req, searchterm) => {
    let data = {
        query: searchterm,
        resultcount: null,
        error: null,
    };

    return {
        start: async () => {
            await trackUserAction(req, 'recipe-search-start', data);
        },
        end: async (resultcount) => {
            data.resultcount = resultcount;
            await trackUserAction(req, 'recipe-search-end', data);
        },
        error: async (err) => {
            data.error = JSON.stringify(err);
            await trackUserAction(req, 'recipe-search-error', data);
        },
    };
};

module.exports = { track, trackUserAction, trackRecipeSearch };
