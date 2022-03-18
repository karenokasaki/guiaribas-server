const mongoose = require("mongoose") 
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    favorite: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Store"
    }]
})

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel