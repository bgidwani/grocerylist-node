'use strict';

const utils = require('../lib');
const axios = require('axios');

const sampleRecipeData = [
    {
        recipe: {
            label: 'Chicken',
            yield: 3,
            totalTime: 10,
            ingredientLines: [
                '1/2 cup of olives',
                '2 large russet potatoes, peeled and cut into chunks',
            ],
            healthLabels: ['Vegetarian', 'Nut free'],
        },
    },
];

const getAll = async (req, res) => {
    //console.log('Executing list - getAll method');
    const app_id = process.env.RECIPE_APP_ID;
    const app_key = process.env.RECIPE_APP_KEY;

    if (!req.query || !req.query.keyword) {
        return utils.response.sendBadRequest(res, 'Search term is missing');
    }

    const searchUrl = `https://api.edamam.com/search?app_id=${app_id}&app_key=${app_key}&q=${req.query.keyword}`;

    let data = [];
    if (process.env.NODE_ENV === 'test') {
        data = sampleRecipeData;
    } else {
        data = await axios.get(searchUrl).then((res) => {
            if (res.data && res.data.hits) {
                //console.log(res.data.hits);
                res.data.hits.map((item) => {
                    data.push({
                        label: item.recipe.label,
                        source: item.recipe.source,
                        url: item.recipe.url,
                        image: item.recipe.image,
                        yield: item.recipe.yield,
                        totalTime: item.recipe.totalTime,
                        calories: item.recipe.calories,
                        totalWeight: item.recipe.totalWeight,
                        source: item.recipe.source,
                        ingredientLines: item.recipe.ingredientLines,
                        healthLabels: item.recipe.healthLabels,
                    });
                });

                return data;
            }
            return null;
        });
    }

    return utils.response.sendSuccess(res, data);
};

module.exports = { getAll };
