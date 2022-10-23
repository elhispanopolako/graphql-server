import mongoose from "mongoose";
import { database } from "./config.js";

mongoose.connect(database, {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to mongoDB')
}).catch(error => {
    console.error('Error connection to mongo' + error.message)
})
