import express from "express";

import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import userModel from "../models/user.model.js";
import serviceModel from "../models/service.model.js";
import commentModel from "../models/comment.model.js";

const serviceRoute = express.Router();

serviceRoute.get("/", async (req, res) => {
  try {
    const services = await serviceModel.find().populate("provider");
    return res.json(services);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error getting services" });
  }
});

serviceRoute.post("/create", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const service = await serviceModel.create({
      ...req.body,
      provider: req.currentUser._id,
    });

    return res.status(201).json(service);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

//get all unprotect

// get one order - only who created
serviceRoute.get("/:idService", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const service = await serviceModel
      .findById(req.params.idService)
      .populate({ path: "provider", select: "username email phone" });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    service.viewed += 1;
    await service.save();

    return res.status(200).json(service);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error getting service", error });
  }
});

//edit service
serviceRoute.put("/:idService", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const service = await serviceModel.findById(req.params.idService);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.provider.toString() !== req.currentUser._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedService = await serviceModel.findByIdAndUpdate(
      req.params.idService,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service did not updated" });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating service", error });
  }
});

serviceRoute.delete(
  "/:idService",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const service = await serviceModel.findById(req.params.idService);

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      if (service.provider.toString() !== req.currentUser._id.toString()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Delete all comments associated with the service
      await commentModel.deleteMany({ service: service._id });

      // Delete the service
      await serviceModel.findByIdAndDelete(req.params.idService);

      return res.status(204).end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error deleting service", error });
    }
  }
);

export default serviceRoute;
