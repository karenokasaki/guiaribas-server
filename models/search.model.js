import { Schema, model } from "mongoose";

const CATEGORIES = [
  "Assistência técnica",
  "Aulas",
  "Consultoria",
  "Design e tecnologia",
  "Eventos",
  "Moda e beleza",
  "Reformas e reparos",
  "Saúde",
  "Serviços domésticos",
  "Transporte",
  "Outros",
];

const searchSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewed: { type: Number, min: 0 },
  },
  { timestamps: true }
);
const searchModel = model("Search", searchSchema);
export default searchModel;
