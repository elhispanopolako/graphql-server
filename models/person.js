import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";
const schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLenght: 5
    },
    phone: {
        type: String,
        minLenght: 5
    },
    street: {
        type: String,
        required: true,
        minLenght: 5
    },
    city: {
        type: String,
        required: true,
        minLenght: 2
    }
})
schema.plugin(mongooseUniqueValidator)
export default mongoose.model('Person', schema)