//const { config } = require('dotenv')
import dotenv from 'dotenv';
dotenv.config();
//config()

//module.exports = {
    export default {
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    mongoUri: process.env.MONGO_URI,
    dbName: process.env.DB_NAME,
    port: process.env.PORT || 8080
}