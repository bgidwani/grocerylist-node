'use strict';

const HTTP_STATUS_CODES = require('../lib/httpStatus');

const sendError = (res, status, errortext) => {
    return res.status(status).json({
        status: status,
        error: errortext,
    });
};

const sendNotSupportedError = (req, res) => {
    return res.status(HTTP_STATUS_CODES.NOT_IMPLEMENTED).send('Not supported');
};

const sendUnAuthorizedError = (res, errorText) => {
    return sendError(res, HTTP_STATUS_CODES.UNAUTHORIZED, errorText);
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

const sendjson = (res, status, body) => {
    return res.status(status).json({
        status: status,
        data: body,
    });
};

const sendSuccess = (res, body) => {
    return sendjson(res, HTTP_STATUS_CODES.OK, body);
};

const sendSuccessText = (res, body) => {
    return res.status(HTTP_STATUS_CODES.OK).send(body);
};

const sendNotFoundText = (res, body) => {
    return res.status(HTTP_STATUS_CODES.NOT_FOUND).send(body);
};

module.exports = {
    HTTP_STATUS_CODES,
    sendSuccessText,
    sendNotFoundText,
    sendjson,
    sendSuccess,
    sendError,
    sendInternalError,
    sendBadRequest,
    sendNotFound,
    sendUnAuthorizedError,
    sendNotSupportedError,
};
