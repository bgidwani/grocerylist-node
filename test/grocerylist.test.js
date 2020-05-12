const testconfig = require('./config');
testconfig.init();

const db = require('../app/lib/db');
const httpStatusCodes = require('../app/lib/httpStatus');
const GroceryList = require('../app/models/GroceryList');
const utils = require('./utils');
const chai = require('chai');

const expect = chai.expect;

describe('Grocery List route related tests', () => {
    const testListName = 'Test List';
    var testListId = '';
    beforeEach(async () => {
        await db.executeWithDbContext(async () => {
            await GroceryList.deleteMany({});

            // seed data
            const newList = new GroceryList();
            newList.name = testListName;

            const response = await newList.save();
            //console.log(response);
            testListName = response._id;
        });
    });

    context('Home - /list route', () => {
        const route = '/list';
        context('GET method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .get(route)
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should allow authorized request and return appropriate result', () => {
                return utils.request
                    .authget(route)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        //console.log(res.body.data);
                        var dbData = res.body.data;
                        expect(dbData).to.exist;
                        expect(dbData)
                            .to.be.an('array', 'Returned data should be array')
                            .that.has.lengthOf(
                                1,
                                'Seeded data should be returned'
                            );

                        expect(dbData[0].name).to.be.eq(testListName);
                    });
            });
        });

        context('POST method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .post(route, {})
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should not allow empty body', () => {
                return utils.request
                    .authpost(route, {})
                    .expect(httpStatusCodes.BAD_REQUEST);
            });

            it('should not allow empty name in body', () => {
                return utils.request
                    .authpost(route, { name: '' })
                    .expect(httpStatusCodes.BAD_REQUEST);
            });

            it('should not allow name with less than 4 characters in body', () => {
                return utils.request
                    .authpost(route, { name: '123' })
                    .expect(httpStatusCodes.BAD_REQUEST);
            });

            it('should create new list with appropriate data', () => {
                var newList = {
                    name: 'Test List',
                    items: [
                        { name: 'Onion' },
                        { name: 'Potato' },
                        { name: 'Methi' },
                    ],
                };

                return utils.request
                    .authpost(route, newList)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        var data = res.body.data;
                        expect(data).to.exist;
                        expect(data._id).to.not.be.empty;
                        expect(data.name).to.be.eq(newList.name);
                        expect(data.items).to.have.lengthOf(
                            newList.items.length
                        );
                    });
            });
        });
    });

    context('Individual list - /list/:listid route', () => {
        const route = `/list/${testListId}`;
        context('GET method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .get(route)
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should return not found for invalid id', () => {
                return utils.request
                    .authget(`/list/5eba118711874b432180dc76`)
                    .expect(httpStatusCodes.NOT_FOUND);
            });

            it('should return data for valid id', () => {
                return utils.request.authget(route).expect(httpStatusCodes.OK);
            });
        });
    });
});
