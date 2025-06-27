// MongoDB connection setup
import app from "./app.js";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

const URI = process.env.MONGODB_URI || "fallback-uri";

/** connect to mongodb */
mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, (err) => {
      if (err) {
        return console.log("Error: ", err);
      }
      console.log(`listening on port ${PORT}`);
    });
  })
  .catch((err) => console.log("error connecting to Mongodb: " + err));

export default mongoose;
