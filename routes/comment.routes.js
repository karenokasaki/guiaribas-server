import express from "express";

import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import userModel from "../models/user.model.js";
import commentModel from "../models/comment.model.js";

const commentRoute = express.Router();

// create comment and if it already exist, updated it.
commentRoute.post(
  "/:idProvider",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { idProvider } = req.params;
    try {
      // Procurar o serviço pelo ID
      const provider = await userModel.findById(idProvider);

      // Se o serviço não existir, retornar um erro 404
      if (!provider) {
        return res.status(404).json({ msg: "Provider not found" });
      }

      // Checar se o usuário já deixou um comentário para esse prestador
      const existingComment = await commentModel.findOne({
        user: req.currentUser._id,
        provider: idProvider,
      });

      if (!existingComment) {
        // Criar um novo comentário
        const comment = await commentModel.create({
          user: req.currentUser._id,
          comment: req.body.comment,
          provider: idProvider,
        });

        await userModel.findByIdAndUpdate(
          idProvider,
          {
            $push: {
              comments: comment._id,
            },
          },
          { new: true, runValidators: true }
        );
      } else {
        await commentModel.findByIdAndUpdate(
          existingComment._id,
          {
            ...req.body,
          },
          { new: true, runValidators: true }
        );
      }

      return res.status(201).json();
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
);

// Deletar comentário
commentRoute.delete(
  "/:idComment",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { idComment } = req.params;
    try {
      const comment = await commentModel.findById(idComment);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user is the owner of the comment
      if (comment.user.toString() !== req.currentUser._id.toString()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const deletedComment = await commentModel.findByIdAndDelete(idComment);

      // Remove the comment from the user's comments array
      await userModel.findByIdAndUpdate(
        deletedComment.provider,
        { $pull: { comments: deletedComment._id } },
        { new: true }
      );

      return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error deleting comment", error });
    }
  }
);

export default commentRoute;
