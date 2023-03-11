import { Router } from "express";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import uploadImg from "../config/cloudinary.config.js";

const uploadRouter = Router();

uploadRouter.post(
  "/image",
  isAuth,
  attachCurrentUser,
  uploadImg.single("picture"),
  (req, res) => {
    // Verifica se há um arquivo na request
    if (!req.file) {
      return res.status(500).json({ message: "Upload failed" });
    }

    return res.status(201).json({ url: req.file.path });
  }
);

export default uploadRouter;
