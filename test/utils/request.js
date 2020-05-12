const baseUrl = 'https://localhost:3000';

const request = require('supertest');
const app = require('../../app/server.js');
const acl = require('../../app/middleware/acl');

const testUserId = '12345';
const testToken = acl.token.generate(testUserId);

// a helper function to make a POST request.
const setHeaders = (request, token) => {
    request.set('Accept', 'application/json');
    request.set('Origin', baseUrl);
    if (token) {
        request.set('Authorization', token);
    }
};

const internalPost = (url, body, token) => {
    const httpRequest = request(app).post(url);
    httpRequest.send(body);
    setHeaders(httpRequest, token);
    return httpRequest;
};

const internalGet = (url, token) => {
    const httpRequest = request(app).get(url);
    setHeaders(httpRequest, token);
    return httpRequest;
};

const post = (url, body) => {
    return internalPost(url, body, null);
};

const get = (url) => {
    return internalGet(url, null);
};

const authpost = (url, body) => {
    return internalPost(url, body, testToken);
};

const authget = (url) => {
    return internalGet(url, testToken);
};

module.exports = { get, post, authget, authpost };
