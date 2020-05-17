'use strict';

const GroceryList = require('../models/GroceryList');
const utils = require('../lib');
const { validateList, validateName } = require('./lib/validations');

const executeAndRespond = async (res, callback) => {
    const message = await utils.db.executeWithDbContext(callback);

    if (message !== true) {
        return utils.response.sendInternalError(res, message);
    }
};

const invalidIdError = 'Invalid Id specified';

const userId = (req) => req.user.id;

const findItemById = (id) => {
    return GroceryList.findById(id).select('-__v');
};

const getAll = async (req, res) => {
    //console.log('Executing list - getAll method');
    return executeAndRespond(res, async () => {
        const items = await GroceryList.find({ user: userId(req) }).select(
            '-__v'
        );
        return utils.response.sendSuccess(res, items);
    });
};

const create = async (req, res) => {
    //console.log('Executing list - create method');
    var data = req.body;
    const { error } = validateList(data);
    //console.log(error);
    if (error) {
        return utils.response.sendBadRequest(res, error.details[0].message);
    }

    var newList = new GroceryList();
    newList.user = userId(req);
    newList.name = data.name;
    newList.items = data.items;

    return executeAndRespond(res, async () => {
        await newList.save();
        return utils.response.sendSuccess(res, newList);
    });
};

const retrieve = {
    byID: async (req, res) => {
        //console.log('Executing list - retrieve byID method');
        // item id is extracted and stored on locals by middleware
        const id = res.locals.groceryitemid;

        if (!id) {
            return utils.response.sendBadRequest(invalidIdError);
        }

        return executeAndRespond(res, async () => {
            const listItem = await findItemById(id);

            //console.log('Return ', listItem);
            if (!listItem) {
                return utils.response.sendNotFound(res, invalidIdError);
            }

            return utils.response.sendSuccess(res, listItem);
        });
    },
};

const update = async (req, res) => {
    //console.log('Executing list - update method');
    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;
    const data = req.body;

    const updatedList = {
        name: data.name,
        items: data.items,
        updateDate: Date.now(),
    };

    const { error } = validateList(updatedList);
    //console.log(error);
    if (error) {
        return utils.response.sendBadRequest(res, error.details[0].message);
    }

    return executeAndRespond(res, async () => {
        const dbResponse = await GroceryList.findOneAndUpdate(
            { _id: id, user: userId(req) },
            updatedList
        );

        //console.log('Update', dbResponse);
        if (dbResponse) {
            utils.response.sendSuccess(res, 'Success');
        } else {
            utils.response.sendNotFound(res, 'Invalid item');
        }
    });
};

/*
 **  Validates whether Patch request can be executed or not
 */
const ispatchrequestvalid = (operation, path, value) => {
    let isValid = false;

    if (!path || !operation) return false;

    if (path.startsWith('/items')) {
        if (operation === 'add') {
            // expect appropriate name to be provided in input value
            const { error } = validateName(value);
            if (!error) {
                isValid = true;
            }
        } else if (operation === 'replace') {
            // expect item id and field name to be provided in input path (/items/123/xyz)
            var patharray = path.split('/');
            if (patharray.length === 4) {
                let fieldName = patharray[3];
                switch (fieldName) {
                    case 'name':
                        const { error } = validateName(value);
                        if (!error) {
                            isValid = true;
                        }
                        break;
                    case 'bought':
                    case 'quantity':
                        isValid = true;
                        break;
                }
            }
        } else if (operation === 'remove') {
            // expect item id to be provided in input path
            var patharray = path.split('/');
            if (patharray.length === 3) {
                isValid = true;
            }
        }
    } else if (path === 'name') {
        if (operation === 'replace') {
            // expect appropriate name to be provided in input value
            const { error } = validateName(value);
            if (!error) {
                isValid = true;
            }
        }
    }

    return isValid;
};

const patch = async (req, res) => {
    //console.log('Executing list - patch method');

    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;
    let data = req.body;

    let operation = data.op;
    let path = data.path;
    let value = data.value;

    //validate the input
    if (!ispatchrequestvalid(operation, path, value)) {
        return utils.response.sendBadRequest(res, 'Invalid Patch request');
    }

    // connect to database
    await utils.db.connectDb();

    //validate the input list id in the request
    const listItem = await findItemById(id);
    if (!listItem) {
        return utils.response.sendNotFound(res, invalidIdError);
    }

    if (path.startsWith('/items')) {
        switch (operation) {
            case 'add':
                //add an item under the current list
                const itemCount = listItem.items.length;

                listItem.items.push({
                    name: data.value,
                    quantity: 1,
                    bought: false,
                });
                listItem.updateDate = Date.now();
                const dbResponse = await listItem.save();
                //validate that one additional item was added to the collection
                if (dbResponse.items.length === itemCount + 1) {
                    return utils.response.sendSuccess(res, 'Success');
                }
                break;

            case 'replace':
                var patharray = data.path.split('/');
                if (patharray.length === 4) {
                    var itemid = patharray[2];
                    var itemfield = patharray[3];
                    var opts = { runValidators: true };

                    var update = {};
                    update[`items.$.${itemfield}`] = data.value;

                    //update the necessary field
                    await GroceryList.updateOne(
                        { _id: id, 'items._id': itemid },
                        {
                            $set: update,
                            updateDate: Date.now(),
                        },
                        opts
                    );

                    return utils.response.sendSuccess(res, 'Success');
                }
                break;
            case 'remove':
                var patharray = data.path.split('/');
                if (patharray.length === 3) {
                    var itemid = patharray[2];
                    //remove the item from the current list
                    await GroceryList.updateOne(
                        { _id: id },
                        {
                            $pull: { items: { _id: itemid } },
                            updateDate: Date.now(),
                        },
                        { multi: false }
                    );

                    return utils.response.sendSuccess(res, 'Success');
                }
                break;
            default:
                break;
        }
    } else if (path === 'name' && operation === 'replace') {
        const dbResponse = await GroceryList.updateOne(
            { _id: id },
            {
                name: data.value,
                updateDate: Date.now(),
            }
        );

        if (dbResponse.ok) {
            return utils.response.sendSuccess(res, 'Success');
        }
    }

    return utils.response.sendInternalError(
        res,
        'Patch request - Something went wrong while adding item to list'
    );
    //return utils.response.sendNotSupportedError(req, res);
};

const remove = async (req, res) => {
    //console.log('Executing list - remove method');
    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;

    var message = await utils.db.executeWithDbContext(async () => {
        const dbResponse = await GroceryList.findOneAndDelete({
            _id: id,
            user: userId(req),
        });

        //console.log('Delete', dbResponse);
        if (dbResponse) {
            return utils.response.sendSuccess(res, 'Success');
        } else {
            return utils.response.sendNotFound(res, 'Invalid item');
        }
    });

    if (message !== true) {
        return utils.response.sendInternalError(res, message);
    }
};

module.exports = { getAll, create, retrieve, update, patch, remove };
