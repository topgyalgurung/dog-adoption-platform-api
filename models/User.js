import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  // email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords
  ownedDogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }], // Reference to Dog
  adoptedDogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog" }], // Reference to Dog
  notifications: [
    {
      // for in app notification to store message by adopter
      message: String,
      date: { type: Date, default: Date.now },
    },
  ],
  // allow to send messages within app, can later display to users on their dashboard or notification tab
});

// hash passwords before saving to db, note dont use arrow func - does not have this access
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is new/modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// compare password for authentication
// userSchema.methods.comparePassword = function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

export default mongoose.model("User", userSchema);
