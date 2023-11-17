//require('dotenv').config({path: './env'});
import dotenv from 'dotenv';
import mongoose from "mongoose";
import {DB_NAME} from './contants.js';
import express from 'express';
import connectDB from './db/index.js';
import { app } from './app.js';

/*
const app = express();
( async() => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on(error, (error) => {
            console.log('Errr', error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening at Port: ${process.env.PORT}`)
        })
    } catch (error) {
        console.log('Error: ', error);
    }
})()
*/

dotenv.config({
    path: './env'
})
connectDB()
.then(() => {
    app.listen(process.env.PORT || 5001, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
}).catch((err) => {
    console.log('Mongo db connection failed', err);
});