const baseUrl = 'https://localhost:3000';

const request = require('supertest');
const app = require('../../app/server.js');

// a helper function to make a POST request.
const post = (url, body) => {
    const httpRequest = request(app).post(url);
    httpRequest.send(body);
    httpRequest.set('Accept', 'application/json');
    httpRequest.set('Origin', baseUrl);
    return httpRequest;
};

module.exports = { post };
