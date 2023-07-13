// Imports
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
require('./db/conn');

const router = require('./routes/routes');
app.use(cors)
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
