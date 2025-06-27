import mongoose from "mongoose";

const dogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    adoptionStatus: {
      type: String,
      enum: ["AVAILABLE", "ADOPTED"],
      default: "AVAILABLE",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adoptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

dogSchema.index({ adoptionStatus: 1 });
const Dog = mongoose.model("Dog", dogSchema);

export default Dog;
