import cors from "cors";
const corsOptions = {
  origin: "http://dogAdoption.com", // example domain
  methods: ["GET", "POST", "PATCH", "DELETE"],
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true, // Allow sending cookies with requests
};
// returns a middleware
export { corsOptions };
