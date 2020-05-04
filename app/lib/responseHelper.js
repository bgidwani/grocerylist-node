'use strict';

const HTTP_STATUS_CODES = require('../lib/httpStatus');

const sendError = (res, status, errortext) => {
    return res.status(status).json({
        status: status,
        error: errortext,
    });
};

const sendInternalError = (res, errorText) => {
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, errorText);
};

const sendBadRequest = (res, errortext) => {
    return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, errortext);
};

const sendNotFound = (res, errortext) => {
    return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, errortext);
};

const sendjson = (res, status, bodytext) => {
    return res.status(status).json({
        status: status,
        message: bodytext,
    });
};

const sendSuccess = (res, bodytext) => {
    return sendjson(res, HTTP_STATUS_CODES.OK, bodytext);
};

module.exports = {
    HTTP_STATUS_CODES,
    sendjson,
    sendSuccess,
    sendError,
    sendInternalError,
    sendBadRequest,
    sendNotFound,
};
