import { model, Schema } from "mongoose";

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

const serviceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    price: {
      type: Number,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Criando o índice no campo 'category'
serviceSchema.index({ category: 1 });

const serviceModel = model("Service", serviceSchema);

export default serviceModel;
