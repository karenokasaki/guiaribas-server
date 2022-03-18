const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ItemSchema = new Schema ({
    store: {
        type: mongoose.Schema.Types.ObjectId, ref: "Store"
    },
    name : {
        type: String
    },
    price: {
        type: Number
    },
    photo: {
        type: String
    },
    desc: {
        type: String
    },
    review: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Review"
    }],
    isActive: {
        type: Boolean
    }
})

const ItemModel = mongoose.model("Item", ItemSchema)
module.exports = ItemModel

