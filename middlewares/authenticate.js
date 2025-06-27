// Replace this file with custom middleware functions, including authentication and rate limiting
//const jwt = require("jsonwebtoken");
// const { verifyToken } = require("../utils/jwtUtils");
import { verifyToken } from "../utils/jwtUtils.js";

// authentication middleware: verify token for protected routes
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: no token provided" });
  }
  const token = authHeader.split(" ")[1]; // get token value comes after Bearer [tokenvalue]
  if (!token || token === "") {
    req.isAuth = false;
    // res.status(401).json({ error: "Unauthorized: No token provided" });
    return next();
  }
  let decodedToken;
  try {
    decodedToken = verifyToken(token); //process.env.JWT_SECRET);
    // req.user = decodedToken;
  } catch (error) {
    req.isAuth = false;
    // res.status(401).json({error: "Unauthorized: invalid token" })
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  // req.userId = decodedToken.userId; // attach user id to request object
  // standardize user object
  req.user = { userId: decodedToken.userId, ...decodedToken }; // Attach the full decoded token to req.user
  // Now, req.user.userId is always available
  next();
};

// module.exports = authenticate;
export default authenticate;
