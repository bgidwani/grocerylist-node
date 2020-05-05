'use strict';

const app = require('./app/server');

//environment config (.env file)
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.SERVER_PORT || 3050;

// listen for incoming requests
app.listen(port, () => {
    console.info(' => Server is up and listening on port [%s]', port);
});
