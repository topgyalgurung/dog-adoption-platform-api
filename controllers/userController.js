//the logic for handling incoming requests and returning responses to the client
// handles user registration, login and token issuance
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwtUtils.js";

// r1. register a new user with a username and password
const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Server error: User registration failed",
      error: error.message,
    });
  }
};

// r2.login user with their credentials. upon login, issue a token valid for 24 hours for auth requests
const login = async (req, res) => {
  
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "User does not exist" });
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.status(401).json({ error: "Password is incorrect" });
    }
    // issue token for 24h
    const token = generateToken({ userId: user._id }, "24h");
    // payload contains userid which identifies authenticated user,
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
};

export { register, login };
