const testconfig = require('./config');
testconfig.init();

const db = require('../app/lib/db');
const httpStatusCodes = require('../app/lib/httpStatus');
const GroceryList = require('../app/models/GroceryList');
const Event = require('../app/models/Event');
const utils = require('./utils');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

// Allows us to use expect syntax with sinon
chai.use(sinonChai);
const expect = chai.expect;

const delay = (time) => new Promise((res) => setTimeout(res, time));
const DEFAULT_DELAY = 5;

describe('Grocery List route related tests', () => {
    const testListName = 'Test List';
    var testListId = '';
    var testListItemCount = 0;
    const invalidListNames = ['', undefined, null, '123', 'ttt'];
    beforeEach(async () => {
        //this.sandbox = sinon.sandbox.create();
        await db.executeWithDbContext(async () => {
            await GroceryList.deleteMany({});
            await Event.deleteMany({});

            // seed data
            const newList = createDbGroceryList(testListName, null);

            const response = await newList.save();
            //console.log(response);
            testListId = response._id;
            testListItemCount = response.items.length;
        });
    });

    afterEach(async () => {
        sinon.restore();
    });

    const createDbGroceryList = (listName, listItems, listUpdateDate) => {
        let newList = new GroceryList({
            name: listName,
            user: utils.request.testUserId,
        });

        if (listItems) {
            newList.items = listItems;
        }

        if (listUpdateDate) {
            newList.updateDate = listUpdateDate;
        }

        return newList;
    };

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

            it('should not return data for a different user', () => {
                return utils.request
                    .authget_user2(route)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        //console.log(res.body.data);
                        var dbData = res.body.data;
                        expect(dbData).to.exist;
                        expect(dbData)
                            .to.be.an('array', 'Returned data should be array')
                            .that.has.lengthOf(
                                0,
                                'No seeded data should be returned for user 2'
                            );
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

            invalidListNames.forEach((invalidname) => {
                it(`should not allow [${invalidname}] as list name in body`, () => {
                    return utils.request
                        .authpost(route, { name: invalidname })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
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

            it('should create new list for current user only', async () => {
                var newList = {
                    name: 'Test List',
                    items: [
                        { name: 'Onion' },
                        { name: 'Potato' },
                        { name: 'Methi' },
                    ],
                };

                await utils.request
                    .authpost(route, newList)
                    .expect(httpStatusCodes.OK);

                //retrieve data for the current user
                await utils.request.authget(route).expect((res) => {
                    var dbData = res.body.data;
                    expect(dbData).to.exist;
                    expect(dbData)
                        .to.be.an('array', 'Returned data should be array')
                        .that.has.lengthOf(
                            2,
                            'Seeded data and new list should be returned'
                        );
                });

                //retrieve data for the other user
                await utils.request.authget_user2(route).expect((res) => {
                    var dbData = res.body.data;
                    expect(dbData).to.exist;
                    expect(dbData)
                        .to.be.an('array', 'Returned data should be array')
                        .that.has.lengthOf(
                            0,
                            'No data should be returned for user2'
                        );
                });
            });
        });
    });

    context('Individual list - /list/:listid route', () => {
        var route = '';
        beforeEach(() => {
            route = `/list/${testListId}`;
        });

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

            it('should return internal server error', () => {
                const findByIdStub = sinon.stub(GroceryList, 'findById');
                findByIdStub.throwsException(
                    new Error('Error connecting to DB')
                );

                return utils.request
                    .authget(route)
                    .expect(httpStatusCodes.INTERNAL_SERVER_ERROR);
            });

            it('should return data for valid id', () => {
                return utils.request
                    .authget(route)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        var data = res.body.data;
                        //console.log(data);
                        expect(data, 'data field should exist').to.exist;
                        expect(data._id, '_id should exist').to.exist;
                        expect(data.name, 'name should exist').to.exist;
                        expect(data.createDate, 'createDate should exist').to
                            .exist;
                        expect(data.items, 'items should exist').to.exist;
                        expect(data.name).to.be.eq(testListName);
                    });
            });
        });

        context('DELETE method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .del(route)
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should return not found for invalid id', () => {
                return utils.request
                    .authdel(`/list/5eba118711874b432180dc76`)
                    .expect(httpStatusCodes.NOT_FOUND);
            });

            it('should return internal server error', () => {
                const findByIdAndDeleteStub = sinon.stub(
                    GroceryList,
                    'findOneAndDelete'
                );
                findByIdAndDeleteStub.throwsException(
                    new Error('Error connecting to DB')
                );

                return utils.request
                    .authdel(route)
                    .expect(httpStatusCodes.INTERNAL_SERVER_ERROR);
            });

            it('should remove the list', async () => {
                await utils.request
                    .authdel(route)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        var data = res.body.data;
                        //console.log(res.body);
                        expect(data, 'data field should exist').to.exist;
                    });

                await utils.request
                    .authget(route)
                    .expect(httpStatusCodes.NOT_FOUND);
            });

            it('should not allow other users to delete the list', async () => {
                await utils.request
                    .authdel_user2(route)
                    .expect(httpStatusCodes.NOT_FOUND);
            });
        });

        context('PATCH method', () => {
            const getPatchReq = (operation, path, newVal) => {
                return { op: operation, path: path, value: newVal };
            };

            it('should not allow unauthorized request', () => {
                return utils.request
                    .patch(route)
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should return not found for invalid id', () => {
                var req = getPatchReq('add', '/items', 'test');
                return utils.request
                    .authpatch(`/list/5eba118711874b432180dc76`, req)
                    .expect(httpStatusCodes.NOT_FOUND);
            });

            const invalidPatchReq = [
                getPatchReq(undefined, undefined, undefined), // empty body should not be allowed
                getPatchReq('add', undefined, '1'), // undefined path should not be allowed
                getPatchReq(undefined, 'name', '1'), // undefined operation should not be allowed
                getPatchReq('test', 'new', '1'), // invalid operation 'test'
                getPatchReq('add', 'name', 'test'), // cannot add 'name'
                getPatchReq('replace', 'test', 'test'), // cannot replace invalid property
                getPatchReq('replace', '/items', 'test'), // replace expects the item id and field name to be provided
                getPatchReq('replace', '/items/1234', 'test'), // expect to have field name specified in replace operation
                getPatchReq('replace', 'name', null), // list name property cannot be set to null in replace operation
                getPatchReq('replace', '/items/1234/name', null), // item name cannot be set to null in replace operation
                getPatchReq('replace', '/items/1234/test', null), // invalid field name ('test') cannot be specified in replace operation
                getPatchReq('remove', 'name', 'test'), // cannot remove 'name'
                getPatchReq('remove', '/items', ''), // cannot remove 'items' without item id in path
                getPatchReq('remove', '/items/1234/123', ''), // expect to have only item id ('/items/123') for remove 'items' operation
                getPatchReq('remove', '/items/1234/', ''), // expect to have only item id ('/items/123') for remove 'items' operation
            ];
            invalidPatchReq.forEach((invalidreq) => {
                it(`should not allow invalid patch body [${JSON.stringify(
                    invalidreq
                )}]`, () => {
                    return utils.request
                        .authpatch(route, invalidreq)
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            context('[add] operation', () => {
                it('should add a new item to the list', async () => {
                    var newitemname = 'TestPotato';
                    var req = getPatchReq('add', '/items', newitemname);
                    await utils.request
                        .authpatch(route, req)
                        .expect(httpStatusCodes.OK);

                    await delay(DEFAULT_DELAY);

                    await db.executeWithDbContext(async () => {
                        const list = await GroceryList.findById(testListId);
                        expect(list.items.length).to.be.eq(
                            testListItemCount + 1
                        );
                        var addedItem = list.items.filter(
                            (item) => item.name === newitemname
                        );
                        expect(addedItem.length).to.be.eq(1);
                        expect(addedItem[0].quantity).to.be.eq(1);
                        expect(addedItem[0].bought).to.be.eq(false);
                    });
                });

                invalidListNames.forEach((invalidname) => {
                    it(`should not allow [${invalidname}] as name while adding item name in list`, async () => {
                        var req = getPatchReq('add', '/items', invalidname);
                        let res = await utils.request.authpatch(route, req);

                        expect(res.status).to.be.eq(
                            httpStatusCodes.BAD_REQUEST
                        );
                    });
                });
            });

            context('[replace] - operation', () => {
                context('name attribute', () => {
                    invalidListNames.forEach((invalidname) => {
                        it(`should not allow [${invalidname}] as name in patch request`, () => {
                            var req = getPatchReq(
                                'replace',
                                'name',
                                invalidname
                            );
                            return utils.request
                                .authpatch(route, req)
                                .expect(httpStatusCodes.BAD_REQUEST);
                        });
                    });

                    it(`should replace name using patch request`, async () => {
                        var newName = testListName + '1';
                        var req = getPatchReq('replace', 'name', newName);
                        await utils.request
                            .authpatch(route, req)
                            .expect(httpStatusCodes.OK);

                        await delay(DEFAULT_DELAY);

                        let list = {};
                        await db.executeWithDbContext(async () => {
                            list = await GroceryList.findById(testListId);
                        });
                        expect(list.name).to.be.eq(newName);
                    });
                });

                context('items collection', () => {
                    let listForItemsContext = {};
                    let routeForItemsContext = '';
                    beforeEach(async () => {
                        listForItemsContext = createDbGroceryList(
                            'Items collection list',
                            [
                                { name: 'Potato', quantity: 1, bought: false },
                                { name: 'Tomato', quantity: 1, bought: false },
                            ],
                            Date.now()
                        );
                        await db.executeWithDbContext(async () => {
                            let item = await listForItemsContext.save();
                            routeForItemsContext = `/list/${item._id}`;
                        });
                        await delay(DEFAULT_DELAY);
                    });

                    const fieldUpdates = [
                        { name: 'bought', newvalue: true },
                        { name: 'quantity', newvalue: 2 },
                    ];

                    fieldUpdates.forEach((field) => {
                        it(`should update [${field.name}] field using patch request`, async () => {
                            var listItemId = listForItemsContext.items[0]._id;
                            var req = getPatchReq(
                                'replace',
                                `/items/${listItemId}/${field.name}`,
                                field.newvalue
                            );
                            await utils.request
                                .authpatch(routeForItemsContext, req)
                                .expect(httpStatusCodes.OK);

                            await delay(DEFAULT_DELAY);

                            let dbList = {};
                            await db.executeWithDbContext(async () => {
                                dbList = await GroceryList.findById(
                                    listForItemsContext._id
                                );
                            });

                            expect(dbList.items[0])
                                .to.have.property(field.name)
                                .which.eq(field.newvalue);
                            expect(dbList.updateDate).to.be.greaterThan(
                                listForItemsContext.updateDate
                            );
                        });
                    });
                });
            });

            context('[remove] operation', async () => {
                it('should remove appropriate item from the list', async () => {
                    let newList = createDbGroceryList('New Test List', [
                        {
                            name: 'Test Potato',
                            quantity: 1,
                        },
                    ]);

                    var listId = '';
                    await db.executeWithDbContext(async () => {
                        var data = await newList.save();
                        listId = data._id;
                    });

                    // send the remove request to Path method
                    req = getPatchReq(
                        'remove',
                        `/items/${newList.items[0]._id}`,
                        ''
                    );
                    await utils.request
                        .authpatch(`/list/${listId}`, req)
                        .expect(httpStatusCodes.OK);

                    await delay(DEFAULT_DELAY);

                    await db.executeWithDbContext(async () => {
                        //find the list again to validate that the sub item was removed
                        var dbList = await GroceryList.findById(listId);
                        expect(dbList.items.length).to.be.eq(0);
                    });
                });
            });
        });

        context('PUT method', () => {
            it('should not allow unauthorized request', () => {
                return utils.request
                    .put(route, {})
                    .expect(httpStatusCodes.UNAUTHORIZED);
            });

            it('should not allow empty body', () => {
                return utils.request
                    .authput(route, {})
                    .expect(httpStatusCodes.BAD_REQUEST);
            });

            invalidListNames.forEach((invalidname) => {
                it(`should not allow [${invalidname}] as list name in body`, () => {
                    return utils.request
                        .authput(route, { name: invalidname })
                        .expect(httpStatusCodes.BAD_REQUEST);
                });
            });

            it('should update the list with appropriate data', async () => {
                const newName = testListName + '1';
                let updatedList = {
                    name: newName,
                    items: [
                        { name: 'Onion' },
                        { name: 'Potato' },
                        { name: 'Methi' },
                    ],
                };

                await utils.request
                    .authput(route, updatedList)
                    .expect(httpStatusCodes.OK)
                    .expect((res) => {
                        //console.log(res.body);
                        var data = res.body.data;
                        expect(data).to.exist;
                    });

                await utils.request.authget(route).expect((res) => {
                    var dbData = res.body.data;
                    expect(dbData).to.exist;
                    expect(dbData.name).to.be.eq(newName);
                    expect(dbData.items).to.have.lengthOf(
                        updatedList.items.length
                    );
                });
            });

            it('should update the list for current user only', async () => {
                const newName = testListName + '1';
                var updatedList = {
                    name: newName,
                    items: [{ name: 'Onion' }, { name: 'Potato' }],
                };

                await utils.request
                    .authput_user2(route, updatedList)
                    .expect(httpStatusCodes.NOT_FOUND);
            });
        });
    });
});
