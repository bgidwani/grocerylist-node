const request = require('supertest');
const app = require('../app/server.js');
const httpStatusCodes = require('../app/lib/httpStatus');

const welcomeText = '<h1>Welcome to the site</h1>';
describe('Main route related tests', () => {
    context('GET method', () => {
        context('/ route', () => {
            it('should return html response', async () => {
                return request(app)
                    .get('/')
                    .expect(httpStatusCodes.OK)
                    .expect('Content-Type', /html/)
                    .expect('Access-Control-Allow-Origin', '*')
                    .expect(welcomeText);
            });
        });

        context('netlify functions route', async () => {
            it('should return html response', function () {
                return request(app)
                    .get('/.netlify/functions/server')
                    .expect(httpStatusCodes.OK)
                    .expect('Content-Type', /html/)
                    .expect(welcomeText);
            });
        });

        context('invalid route', function () {
            it('should return 404 response', function () {
                return request(app)
                    .get('/invalidpage')
                    .expect(httpStatusCodes.NOT_FOUND)
                    .expect('Content-Type', /html/);
            });
        });
    });
});
