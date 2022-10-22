import mongoose from "mongoose";
import { database } from "./config.js";
const monugoURL = 'mongodb+srv://twozniak:test123@cluster0.rdrtxvr.mongodb.net/graphQL'
mongoose.connect(database, {
    useNewUrlParser: true
}).then(() => {
    console.log('Connected to mongoDB')
}).catch(error => {
    console.error('Error connection to mongo' + error.message)
})
