const init = () => {
    process.env.DB_CONNECT = 'mongodb://172.17.0.2:27017/testgrocerylist';
    process.env.TOKEN_SECRET = 'testkey';
};

module.exports = {
    init,
};
