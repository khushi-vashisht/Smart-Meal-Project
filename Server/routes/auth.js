import express from "express";
import { login, register } from "../controllers/auth.js";

const authRouter = express.Router();

/**
 * @route   POST /auth/login
 * @desc    Login a user
 * @access  Public
 */
authRouter.post("/login", login);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
authRouter.post("/register", register);

export default authRouter;
