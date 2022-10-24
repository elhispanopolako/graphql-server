import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    username: {
        type: String,
        requred: true,
        unique: true,
        minlenght: 3
    },
    friends: [
        {
            ref: 'Person',
            type: mongoose.Schema.Types.ObjectId
        }
    ]
})

export default mongoose.model('Username', schema)