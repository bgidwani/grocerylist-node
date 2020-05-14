const testconfig = require('./config');
testconfig.init();

const db = require('../app/lib/db');
const request = require('supertest');
const app = require('../app/server.js');
const httpStatusCodes = require('../app/lib/httpStatus');
const User = require('../app/models/User');
const utils = require('./utils');
const chai = require('chai');

const expect = chai.expect;

describe('Users route related tests', () => {
    beforeEach(async () => {
        await db.executeWithDbContext(async () => {
            await User.deleteMany({});
        });
    });

    context('Home - /users route', () => {
        context('GET method', () => {
            it('should return not supported', () => {
                return request(app)
                    .get('/users')
                    .expect(httpStatusCodes.NOT_IMPLEMENTED);
            });
        });

        context('POST method', () => {
            it('should return not supported', () => {
                return request(app)
                    .post('/users')
                    .expect(httpStatusCodes.NOT_IMPLEMENTED);
            });
        });
    });

    context.skip('Signup - /users/register route', () => {
        const route = '/users/register';

        context('POST method', () => {
            it('should not allow empty body', () => {
                return utils.request
                    .post(route, {})
                    .expect(httpStatusCodes.BAD_REQUEST);
            });

            it('should not allow invalid name', async () => {
                const invalidNames = ['', '123', '12335'];
                invalidNames.forEach(async (name) => {
                    await utils.request
                        .post(route, {
                            name: name,
                            password: 'test1234',
                            email: 'test@123.com',
                        })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            it('should not allow invalid email', async () => {
                const invalidEmails = [
                    '',
                    '123',
                    '12335@test',
                    '123.com',
                    '123@.com',
                ];
                invalidEmails.forEach(async (email) => {
                    await utils.request
                        .post(route, {
                            name: 'test',
                            password: 'test1234',
                            email: email,
                        })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            it('should not allow invalid password', async () => {
                const invalidPasswords = ['', '123', '12345'];
                invalidPasswords.forEach(async (password) => {
                    await utils.request
                        .post(route, {
                            name: 'test',
                            password: password,
                            email: 'test@123.com',
                        })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            it('should be able to register a user', () => {
                const data = {
                    name: 'Test User',
                    email: 'test@mailinator.com',
                    password: 'test1234',
                };
                return utils.request
                    .post(route, data)
                    .expect(httpStatusCodes.CREATED);
            });

            it('should not allow duplicate user', async () => {
                const data = {
                    name: 'Test User',
                    email: 'test@mailinator.com',
                    password: 'test1234',
                };
                await utils.request
                    .post(route, data)
                    .expect(httpStatusCodes.CREATED);
                //try the same request again
                await utils.request
                    .post(route, data)
                    .expect(httpStatusCodes.BAD_REQUEST);
            });
        });

        context('GET method', () => {
            it('should return not supported', () => {
                return request(app)
                    .get(route)
                    .expect(httpStatusCodes.NOT_IMPLEMENTED);
            });
        });
    });

    context('Login - /users/login route', () => {
        const route = '/users/login';

        context('POST method', () => {
            it('should not allow empty body', () => {
                return utils.request
                    .post(route, {})
                    .expect(httpStatusCodes.BAD_REQUEST);
            });

            it('should not allow invalid email', async () => {
                const invalidEmails = [
                    '',
                    '123',
                    '12335@test',
                    '123.com',
                    '123@.com',
                ];
                invalidEmails.forEach(async (email) => {
                    await utils.request
                        .post(route, {
                            name: 'test',
                            password: 'test1234',
                            email: email,
                        })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            it('should not allow invalid password', async () => {
                const invalidPasswords = ['', '123', '12345'];
                invalidPasswords.forEach(async (password) => {
                    await utils.request
                        .post(route, {
                            name: 'test',
                            password: password,
                            email: 'test@123.com',
                        })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            it.skip('should be able to login', async () => {
                const data = {
                    name: 'Test User',
                    email: 'test@mailinator.com',
                    password: 'test',
                };

                //create the user
                await utils.request
                    .post('/users/register', data)
                    .expect(httpStatusCodes.CREATED);
                console.log('User created');
                //login with that user
                const logindata = {
                    email: data.email,
                    password: data.password,
                };
                await utils.request
                    .post(route, logindata)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        expect(res.body.data).to.have.property('token');
                    });
            });

            it.skip('should not allow invalid credentials', async () => {
                const data = {
                    name: 'Test User',
                    email: 'test@mailinator.com',
                    password: 'test',
                };

                //create the user
                await utils.request
                    .post('/users/register', data)
                    .expect(httpStatusCodes.CREATED);

                //try the request with invalid password
                var logindata = {
                    email: data.email,
                    password: data.password + '1',
                };
                await utils.request
                    .post(route, logindata)
                    .expect(httpStatusCodes.NOT_FOUND);

                //try the request with invalid email
                logindata = {
                    email: 'bart@mailinator.com',
                    password: data.password,
                };
                await utils.request
                    .post(route, logindata)
                    .expect(httpStatusCodes.NOT_FOUND);
            });
        });
    });
});
