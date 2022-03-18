const mongoose = require("mongoose")
const Schema = mongoose.Schema

const StoreSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    desc: {
        type: String
    },
    phone: [{
        type: String
    }],
    address: {
        type: String
    },
    workingHour: [{
        type: String
    }],
    items: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Item"
    }],
    Score: [{
        type: Number
    }]
})



const StoreModel = mongoose.model("Store", StoreSchema)

module.exports = StoreModel