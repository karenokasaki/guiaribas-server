import express from "express";
import mongoose from "mongoose";

import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import userModel from "../models/user.model.js";
import serviceModel from "../models/service.model.js";
import commentModel from "../models/comment.model.js";
import searchModel from "../models/search.model.js";

const searchRoute = express.Router();

searchRoute.post("/create", isAuth, attachCurrentUser, async (req, res) => {
  try {
    if (req.currentUser.isProvider) {
      return res
        .status(400)
        .json({ msg: "Só usuários podem abrir uma busca!" });
    }

    const { title, category, description } = req.body;

    const newSearch = await searchModel.create({
      title,
      category,
      description,
      user: req.currentUser._id,
    });

    return res.status(201).json(newSearch);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

searchRoute.get("/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const search = await searchModel
      .findById(req.params.id)
      .populate({ path: "user", select: "-passwordHash -__v -comments" });

    if (!search) {
      return res.status(404).json({ message: "Search not found" });
    }
    return res.status(200).json(search);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error getting search", error });
  }
});

searchRoute.put("/:id/edit", isAuth, attachCurrentUser, async (req, res) => {
  const { title, category, description } = req.body;
  const searchId = req.params.id;

  try {
    // Check if the search exists
    const search = await searchModel.findById(searchId);
    if (!search) {
      return res.status(404).json({ message: "Search not found" });
    }

    // Update the search
    search.title = title;
    search.category = category;
    search.description = description;
    await search.validate();
    await search.save();

    return res.status(200).json(search);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.log(error);
    return res.status(500).json({ message: "Error updating search", error });
  }
});

searchRoute.delete("/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    // Find the search
    const search = await searchModel.findById(req.params.id);

    // If the search doesn't exist, return 404 status
    if (!search) {
      return res.status(404).json({ message: "Search not found" });
    }

    // Delete the search
    await search.delete();

    return res.status(200).json({ message: "Search deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error deleting search", error });
  }
});

export default searchRoute;
