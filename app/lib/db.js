const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

const connectDb = async () => {
    if (isConnected) {
        console.info('=> Connect Db - Reusing database connection');
        return;
    }

    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false, //done to use findOneAndDelete() method on mongo collection
    };

    // console.info('=> Connect Db - Connecting to database');
    var db = await mongoose.connect(process.env.DB_CONNECT, options);
    isConnected = db.connections[0].readyState;
};

const disconnectDb = async () => {
    if (!isConnected) {
        return;
    }

    //console.log('Disconnecting db connection');
    await mongoose.disconnect();
    isConnected = false;
};

const executeWithDbContext = async (callback, raiseerror) => {
    try {
        await connectDb();

        await callback();

        return true;
    } catch (err) {
        console.error(' => executeWithDbContext [%s]', err.message);
        if (raiseerror) {
            throw err;
        } else {
            return err.message;
        }
    } finally {
        await disconnectDb();
    }
};

module.exports = { connectDb, disconnectDb, executeWithDbContext };
