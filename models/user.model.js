import { mongoose, Schema } from "mongoose";

const addressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String, match: [/^[A-Z]{2}$/, "Estado inválido"] },
  zip: {
    type: String,
    required: true,
    match: [/^\d{5}-\d{3}$/, "Invalid zip code format"],
  },
  number: { type: String },
  latitude: { type: String },
  longitude: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de email inválido"],
    },
    phone: { type: String, required: true },
    isProvider: { type: Boolean, default: false },
    address: { type: addressSchema },
    rating: { type: Number, min: 0, max: 10 },
    totalLikes: { type: Number, min: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    viewed: { type: Number, min: 0 },
  },
  {
    timestamps: true,
    indexes: [
      { fields: { email: 1 }, options: { unique: true } },
      { fields: { username: 1 }, options: { unique: true } },
    ],
  }
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
