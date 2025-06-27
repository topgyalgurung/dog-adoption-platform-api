// centralized entry point for the application

import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js";
import dogRoutes from "./routes/dogRoutes.js";

// const MongoDBSession = require("connect-mongodb-session")(session);

import cors from "cors";
import { corsOptions } from "./cors/index.js";

const app = express();

// middleware:
// to parse incoming JSON requests
app.use(express.json());
// app.use(cookieParser());

// this Enable CORS for all routes and all domains
// app.use(cors());

app.use(cors(corsOptions)); // custom CORS

// Use Helmet to secure HTTP headers. it sets various http headers  to protect from vulnerabilities
// you can also customize or disable individual protections if need like frameguard(clickjacking),
app.use(helmet());

app.get("/api", (req, res) => {
  res.json({
    message:
      "This is a response from the API for secured Dog Adoption Platform app",
  });
});

/** rate limiting */
// Create a rate limiter with the desired configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each ip to 100 requests per windoMs
  message: "Too many requests, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiter to all API routes
app.use("/api/", apiLimiter); // Protect all routes starting with `/api/`

// Example of an open route that is not rate-limited
app.get("/", (req, res) => {
  res.status(200).send("Welcome to the open route");
});

/** routes and validation */
app.use("/api/users", userRoutes);
app.use("/api/dogs", dogRoutes);

export default app;
