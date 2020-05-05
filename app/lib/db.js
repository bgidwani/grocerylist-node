const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

const connectDb = () => {
    if (isConnected) {
        console.info('=> Connect Db - Reusing database connection');
        return Promise.resolve();
    }

    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    console.info('=> Connect Db - Connecting to database');
    return mongoose.connect(process.env.DB_CONNECT, options).then((db) => {
        isConnected = db.connections[0].readyState;
    });
};

const disconnectDb = () => {
    if (!isConnected) {
        return Promise.resolve();
    }

    return mongoose.disconnect().then(() => {
        isConnected = false;
    });
};

const executeWithDbContext = async (callback) => {
    try {
        await connectDb();

        await callback();

        return true;
    } catch (err) {
        console.error(' => executeWithDbContext [%s]', err.message);
        return err.message;
    } finally {
        await disconnectDb();
    }
};

module.exports = { connectDb, disconnectDb, executeWithDbContext };
