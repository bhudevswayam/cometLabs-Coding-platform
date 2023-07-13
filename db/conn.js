const { default: mongoose } = require("mongoose");
require('dotenv').config()
const MONGODB_URL = process.env.MONGODB_URL

mongoose.connect(MONGODB_URL).then(()=>console.log(`Connected Sucessfully with DB`)).catch((err)=>console.log(err));