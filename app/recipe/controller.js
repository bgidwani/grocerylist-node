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

    const query = req.query.keyword;
    const trackSearch = utils.logger.trackRecipeSearch(req, query);

    await trackSearch.start();

    const searchUrl = `https://api.edamam.com/search?app_id=${app_id}&app_key=${app_key}&q=${query}`;

    let data = null;
    if (process.env.NODE_ENV === 'test') {
        data = sampleRecipeData;
    } else {
        try {
            let res = await axios.get(searchUrl);
            // console.log(res.data);
            if (res.data && res.data.hits) {
                data = [];
                //console.log(res.data.hits);
                res.data.hits.map((item) => {
                    const recipe = item.recipe;
                    const servings = recipe.yield;
                    const totalCalories = recipe.calories;
                    let caloriesperserving = null;
                    if (servings && totalCalories) {
                        caloriesperserving = totalCalories / servings;
                    }

                    data.push({
                        label: recipe.label,
                        source: recipe.source,
                        url: recipe.url,
                        image: recipe.image,
                        yield: servings,
                        totalTime: recipe.totalTime,
                        caloriesPerServing: caloriesperserving,
                        totalWeight: recipe.totalWeight,
                        source: recipe.source,
                        ingredientLines: recipe.ingredientLines,
                        healthLabels: recipe.healthLabels,
                    });
                });

                await trackSearch.end(data.length);
            }
        } catch (err) {
            //console.log(err);
            await trackSearch.error(err.response.data);
            data = err.response.data;
        }
    }

    return utils.response.sendSuccess(res, data);
};

module.exports = { getAll };
