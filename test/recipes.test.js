process.env.NODE_ENV = 'test';

const utils = require('./utils');
const httpStatusCodes = require('../app/lib/httpStatus');
const chai = require('chai');
const expect = chai.expect;

describe('Recipe route related tests', () => {
    context('Home - /recipes route', () => {
        const route = '/recipes';
        context('GET method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .get(route)
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should allow authorized request and return data', () => {
                let routewithquery = `${route}?keyword=chicken`;
                return utils.request
                    .authget(routewithquery)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        let data = res.body.data;
                        //console.log(data);
                        expect(data).to.be.an('array');
                        expect(data.length).to.be.greaterThan(0);
                    });
            });

            it('should return error if [query] param is missing', () => {
                return utils.request
                    .authget(route)
                    .expect(httpStatusCodes.BAD_REQUEST);
            });
        });

        context('POST method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .post(route, {})
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should return not supported error', () => {
                return utils.request
                    .authpost(route, {})
                    .expect(httpStatusCodes.NOT_IMPLEMENTED);
            });
        });
    });
});
