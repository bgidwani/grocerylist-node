const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

const connectDb = () => {
    if (isConnected) {
        console.log('=> reuse existing database connection');
        return Promise.resolve();
    }

    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    console.log('=> connecting to database');
    return mongoose.connect(process.env.DB_CONNECT, options).then((db) => {
        isConnected = db.connections[0].readyState;
    });
};

const disconnectDb = () => {
    if (!isConnected) {
        console.log('=> no connection available');

        return Promise.resolve();
    }

    return mongoose.disconnect().then(() => {
        isConnected = false;
    });
};

const executeWithDbContext = async (callback) => {
    await connectDb();

    await callback();

    await disconnectDb();
};

module.exports = { connectDb, disconnectDb, executeWithDbContext };
