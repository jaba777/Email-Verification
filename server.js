const connectDB = require('./config/db.js')
const express = require('express');
const parser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const UseRouter= require('./api/User.js');
const app= express();

app.use(parser.json());
app.use(cors());
dotenv.config()


connectDB();

app.use('/',UseRouter)

const PORT=process.env.PORT || 8800;


app.listen(PORT,()=>{
    console.log('Server is running');
})

