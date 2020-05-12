'use strict';

const GroceryList = require('../models/GroceryList');
const utils = require('../lib');
const { validateCreate } = require('./lib/validations');

const executeAndRespond = async (res, callback) => {
    var message = await utils.db.executeWithDbContext(callback);

    if (message !== true) {
        return utils.response.sendInternalError(res, message);
    }
};

const getAll = async (req, res) => {
    await executeAndRespond(res, async () => {
        const items = await GroceryList.find().select('-__v');
        return utils.response.sendSuccess(res, items);
    });
};

const create = async (req, res) => {
    var data = req.body;
    const { error } = validateCreate(data);
    //console.log(error);
    if (error) {
        return utils.response.sendBadRequest(res, error.details[0].message);
    }

    var newList = new GroceryList();
    newList.name = data.name;
    newList.items = data.items;

    return executeAndRespond(res, async () => {
        await newList.save();
        return utils.response.sendSuccess(res, newList);
    });
};

const retrieve = {
    byID: async (req, res) => {
        // item id is extracted and stored on locals by middleware
        const id = res.locals.groceryitemid;
        var invalidIdError = 'Invalid Id specified';

        if (!id) {
            return utils.response.sendBadRequest(invalidIdError);
        }

        return executeAndRespond(res, async () => {
            const listItem = await GroceryList.findById(id).select('-__v');

            if (!listItem) {
                return utils.response.sendNotFound(res, invalidIdError);
            }

            return utils.response.sendSuccess(res, listItem);
        });
    },
};

const update = async (req, res) => {
    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;
    var data = req.body;
    const newlistname = data.name;
    const updatedItems = data.items;

    return executeAndRespond(res, async () => {
        const dbResponse = await GroceryList.updateOne(
            { _id: id },
            {
                name: newlistname,
                items: updatedItems,
                updateDate: Date.now,
            }
        );

        if (dbResponse.ok) {
            utils.response.sendSuccess(res, 'Success');
        } else {
            utils.response.sendInternalError(res, dbResponse);
        }
    });
};

const patch = async (req, res) => {
    const allowedPaths = ['name', '/items'];
    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;
    var data = req.body;

    if (data.op === 'add' && data.path.startsWith('/items')) {
        //add an item under the current list
        return executeAndRespond(res, async () => {
            const listitem = await GroceryList.findById(id);
            const itemCount = listitem.items.length;
            listitem.items.push({
                name: data.value,
                quantity: 1,
                bought: false,
            });
            listitem.updateDate = Date.now();
            const dbResponse = await listitem.save();
            //validate that one additional item was added to the collection
            if (dbResponse.items.length === itemCount + 1) {
                return utils.response.sendSuccess(res, 'Success');
            }
        });
    } else if (data.op === 'replace') {
        var ispathallowed = allowedPaths.filter((path) =>
            data.path.startsWith(path)
        );
        if (ispathallowed.length > 0) {
            // update the name of the list item
            if (data.path === 'name' && data.value !== '') {
                return executeAndRespond(res, async () => {
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
                });
            } else if (data.path.startsWith('/items')) {
                var patharray = data.path.split('/');
                if (patharray.length === 4) {
                    var itemid = patharray[2];
                    var itemfield = patharray[3];
                    var opts = { runValidators: true };

                    return executeAndRespond(res, async () => {
                        var update = {};
                        update[`items.$.${itemfield}`] = data.value;

                        //update the necessary field
                        const dbResponse = await GroceryList.updateOne(
                            { _id: id, 'items._id': itemid },
                            {
                                $set: update,
                                updateDate: Date.now(),
                            },
                            opts
                        );

                        if (dbResponse.ok) {
                            return utils.response.sendSuccess(res, 'Success');
                        }
                    });
                }
            }
        }
    } else if (data.op === 'remove' && data.path.startsWith('/items')) {
        var patharray = data.path.split('/');
        if (patharray.length === 3) {
            var itemid = patharray[2];
            //remove the item from the current list
            return executeAndRespond(res, async () => {
                await GroceryList.updateOne(
                    { _id: id },
                    {
                        $pull: { items: { _id: itemid } },
                        updateDate: Date.now(),
                    },
                    { multi: false }
                );

                return utils.response.sendSuccess(res, 'Success');
            });
        }
    }

    return utils.response.sendNotSupportedError(req, res);
};

const remove = async (req, res) => {
    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;

    var message = await utils.db.executeWithDbContext(async () => {
        const dbResponse = await GroceryList.findByIdAndDelete(id);

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
