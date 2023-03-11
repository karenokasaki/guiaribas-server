import express from "express";
import bcrypt from "bcrypt";

import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import generateToken from "../config/jwt.config.js";
import userModel from "../models/user.model.js";
import ratingsModel from "../models/ratings.model.js";
import commentModel from "../models/comment.model.js";
import searchModel from "../models/search.model.js";
import serviceModel from "../models/service.model.js";

const userRouter = express.Router();

const saltRounds = 10;
userRouter.post("/sign-up", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#_!])[0-9a-zA-Z$*&@#_!]{8,}$/
      )
    ) {
      // retorna Bad Request
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    // geração de salts e password criptografada
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });
    // Deleta o password e a versão no retorno da atualização
    delete newUser._doc.passwordHash;
    delete newUser._doc.__v;

    //log usuario foi criado

    // retorna success para criação de um novo usuário
    return res.status(201).json(newUser._doc);
  } catch (error) {
    // retorna Internal Server Error

    return res.status(450).json({ msg: error.message });
  }
});

// Rota de Login
userRouter.post("/login", async (req, res) => {
  try {
    // extrai o email e password da requisição do usuário.
    const { email, password } = req.body;

    // pesquisa o usuário no banco pelo email
    const user = await userModel.findOne({ email });

    // Verificar se existe o usuário no nosso banco de dados.
    if (!user) {
      // Retorna Bad Request
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website!" });
    }

    // Verificar se a senha digitada pelo usuário é igual ao do banco de dados
    if (await bcrypt.compare(password, user.passwordHash)) {
      // Geração do token de acesso
      const token = generateToken(user);

      // Retorna success a tentativa de login
      return res.status(200).json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isProvider: user.isProvider,
        },
        token,
      });
    } else {
      // Retorna unauthorized
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (error) {
    // Retorna Internal Server Error
    return res.status(500).json({ msg: error.message });
  }
});

// Rota para buscar usuário
userRouter.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    const populateUser = await userModel
      .findById(loggedUser._id, { passwordHash: 0, __v: 0 })
      .populate("comments");

    // Retorna success quando o usuário esta logado
    return res.status(200).json(populateUser);
  } catch (error) {
    // Retorna Internal Server Error
    return res.status(500).json({ msg: error.message });
  }
});

userRouter.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const user = await userModel.findById(userId, { passwordHash: 0, __v: 0 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's information
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }
    await search.validate();
    await user.save();
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating user", error });
  }
});

// Route to give a rating to a service provider
userRouter.post(
  "/:idProvider/ratings",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      // Check if user is not a provider
      const user = req.currentUser;

      if (user.isProvider) {
        return res
          .status(403)
          .json({ msg: "Forbidden, only users can rate Providers" });
      }

      // Check if the provider exists and is a provider
      const provider = await userModel.findById(req.params.idProvider);
      if (!provider || !provider.isProvider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      // Check if the user has already rated this provider for this service
      const existingRating = await ratingsModel.findOne({
        user: user._id,
        provider: provider._id,
      });

      if (existingRating) {
        existingRating.rating = req.body.rating;
        await search.validate();
        await existingRating.save();

        // Update the provider's rating
        const providerRatings = await ratingsModel.find({
          provider: provider._id,
        });
        const totalRating = providerRatings.reduce(
          (acc, curr) => acc + curr.rating,
          0
        );
        provider.rating = totalRating / providerRatings.length;
        await search.validate();

        await provider.save();

        return res.status(200).json(existingRating);
      }

      // Create a new rating for the provider
      const newRating = await ratingsModel.create({
        user: user._id,
        provider: provider._id,
        rating: req.body.rating,
      });

      // Update the provider's rating
      const providerRatings = await ratingsModel.find({
        provider: provider._id,
      });
      const totalRating = providerRatings.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      provider.rating = totalRating / providerRatings.length;
      provider.totalLikes = providerRatings.length;
      await search.validate();
      await provider.save();

      return res.status(201).json(newRating);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error giving rating", error });
    }
  }
);

userRouter.delete("/delete", isAuth, attachCurrentUser, async (req, res) => {
  try {
    // Find and delete the user
    const deletedUser = await userModel.findByIdAndDelete(req.currentUser._id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all ratings associated with the user
    await ratingsModel.deleteMany({ user: req.currentUser._id });

    //! recalcute the rating - ARRUMAR ISSO DEPOIS
    const providers = await userModel.find({ isProvider: true });
    for (let provider of providers) {
      const providerRatings = await ratingsModel.find({
        provider: provider._id,
      });
      const totalRating = providerRatings.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      provider.rating = totalRating / providerRatings.length;
      await search.validate();
      await provider.save();
    }

    //delete all the comments
    await commentModel.deleteMany({ user: req.currentUser._id });

    //delete all the searches
    await searchModel.deleteMany({ user: req.currentUser._id });

    //delete all the services
    await serviceModel.deleteMany({ provider: req.currentUser._id });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error deleting user", error });
  }
});

export default userRouter;
