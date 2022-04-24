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
    }],
    passwordHash: {
        type: String /* required: true */
    },
    role: {
        type: String
    },
    createDate: { type: Date, required: true, default: Date.now },
    userIsActive: { type: Boolean, default: true },
})

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel