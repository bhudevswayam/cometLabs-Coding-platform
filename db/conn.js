const { default: mongoose } = require("mongoose");
require('dotenv').config()
const MONGODB_URL = process.env.MONGODB_URL
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://swayampandya1236:OFmngxwKPCo0cUAj@cluster0.bupqiag.mongodb.net/?retryWrites=true&w=majority').then(()=>console.log(`Connected Sucessfully with DB`)).catch((err)=>console.log(err));