'use strict';

/**
 * Extracts item id from the request
 * @param  {Object}   req      -- Input request
 * @param  {Object}   res      -- Response
 * @param  {Function} next
 * @param  {String}   listId
 */
const getParam = async (req, res, next, listId) => {
    if (listId) {
        res.locals.groceryitemid = listId;
    }

    next();
};

module.exports = { getParam };
