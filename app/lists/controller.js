'use strict';

const GroceryList = require('../models/GroceryList');
const utils = require('../lib');

const getAll = async (req, res) => {
    await utils.db.executeWithDbContext(async () => {
        const items = await GroceryList.find({}).select('-__v');
        return utils.response.sendSuccess(res, items);
    });
};

const create = async (req, res) => {
    var data = req.body;
    var newList = new GroceryList();
    newList.name = data.name;
    newList.items = data.items;

    await utils.db.executeWithDbContext(async () => {
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

        var message = await utils.db.executeWithDbContext(async () => {
            const listItem = await GroceryList.findById(id).select('-__v');

            if (!listItem) {
                return utils.response.sendNotFound(res, invalidIdError);
            }

            return utils.response.sendSuccess(res, listItem);
        });

        if (message !== true) {
            return utils.response.sendInternalError(res, message);
        }
    },
};

const remove = async (req, res) => {
    // item id is extracted and stored on locals by middleware
    const id = res.locals.groceryitemid;

    var message = await utils.db.executeWithDbContext(async () => {
        const dbResponse = await GroceryList.findByIdAndDelete(id);

        if (dbResponse) {
            return utils.response.sendSuccess(res, 'Done');
        } else {
            return utils.response.sendNotFound(res, 'Invalid item');
        }
    });

    if (message !== true) {
        return utils.response.sendInternalError(res, message);
    }
};

module.exports = { getAll, create, retrieve, remove };
