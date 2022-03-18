const express = require("express")
const router = express.Router()
const UserModel = require("../models/User.model")
const ItemModel = require("../models/Item.model.js")
const ReviewModel = require("../models/Review.model.js")
const StoreModel = require("../models/Store.model.js")

router.get('/user', async (req, res) => {
    //find by email
    const user = req.body.email

    try {
        const oneUser = await UserModel.find({ email: user })
        return res.status(200).json(oneUser)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: error.mensage })
    }
})

router.post('/create-user', async (req, res) => {
    try {
        const newUser = await UserModel.create({
            ...req.body
        })

        console.log(newUser)

        return res.status(201).json(newUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.mensage })
    }
})

module.exports = router