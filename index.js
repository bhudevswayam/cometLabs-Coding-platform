// Imports
const bodyParser = require('body-parser');
const express = require('express');
require('./db/conn');

const router = require('./routes/routes');
// load .env
require('dotenv').config();

// Express
const app = express();

// Constants
const PORT = process.env.PORT || 3000;

// express extensions
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);

// listen on port
app.listen(PORT);
