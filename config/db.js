const mongoose= require('mongoose')
const dotenv = require('dotenv');

dotenv.config();


const url=process.env.MONGO_URL;


const connectDB= async ()=>{
    try {
        const conn = await mongoose.connect(url);
        console.log(`mongo connect ${conn.connection.host}`)
    } catch (error) {
        console.log('error'.red);
    }
}


module.exports = connectDB;
