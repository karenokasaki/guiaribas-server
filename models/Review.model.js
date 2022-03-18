const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ReviewsSchema = new Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    store: {
        type: mongoose.Schema.Types.ObjectId, ref: "Store"
    },
    item: {
        type: mongoose.Schema.Types.ObjectId, ref: "Item"
    },
    review: {
        type: String
    },
    score: {
        type: Number
    },
    date: {
        type: String
    }
})

const ReviewModel = mongoose.model("Review", ReviewsSchema)
module.exports = ReviewModel

