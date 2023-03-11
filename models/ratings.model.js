import { mongoose, Schema } from "mongoose";

const ratingsSchema = new Schema(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);
const ratingsModel = mongoose.model("Rating", ratingsSchema);
export default ratingsModel;
