'use strict';

const app = require('./app/server');

//environment config (.env file)
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.SERVER_PORT || 3000;

// listen for incoming requests
app.listen(port, () => {
    console.log('Server is up and listening on port', port);
});
