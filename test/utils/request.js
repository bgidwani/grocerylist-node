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

const internalPatch = (url, body, token) => {
    const httpRequest = request(app).patch(url);
    httpRequest.send(body);
    setHeaders(httpRequest, token);
    return httpRequest;
};

const internalPut = (url, body, token) => {
    const httpRequest = request(app).put(url);
    httpRequest.send(body);
    setHeaders(httpRequest, token);
    return httpRequest;
};

const internalDelete = (url, token) => {
    const httpRequest = request(app).delete(url);
    setHeaders(httpRequest, token);
    return httpRequest;
};

const post = (url, body) => {
    return internalPost(url, body, null);
};

const get = (url) => {
    return internalGet(url, null);
};

const patch = (url, body) => {
    return internalPatch(url, body, null);
};

const put = (url, body) => {
    return internalPut(url, body, null);
};

const del = (url) => {
    return internalDelete(url, null);
};

const authget = (url) => {
    return internalGet(url, testToken);
};

const authpost = (url, body) => {
    return internalPost(url, body, testToken);
};

const authput = (url, body) => {
    return internalPut(url, body, testToken);
};

const authpatch = (url, body) => {
    return internalPatch(url, body, testToken);
};

const authdel = (url) => {
    return internalDelete(url, testToken);
};

module.exports = {
    get,
    post,
    patch,
    put,
    del,
    authget,
    authpost,
    authpatch,
    authput,
    authdel,
};
