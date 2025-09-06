import { Router } from "express";
import {
  getCurrentUser,
  logout,
  refreshToken,
  signIn,
  signUp,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/verify-token.js";

const usersRouter = Router();

usersRouter.post("/sign-up", signUp);
usersRouter.post("/sign-in", signIn);

usersRouter.get("/refresh-token", refreshToken);
usersRouter.post("/logout", logout);

// Protected routes
usersRouter.get("/me", verifyToken, getCurrentUser);

export { usersRouter };
