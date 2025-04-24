import express from 'express';
import { login, logout, signup, getMe, forgotPassword, resetPassword, refreshAccessToken } from '../controllers/auth-controller.js';
import { protectRoute } from '../middleware/protect-route.js';

const router = express.Router();

router.get("/me", protectRoute, getMe);

router.post("/login", login);

router.post("/logout", logout);

router.post("/signup", signup);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.post("/refresh", refreshAccessToken);

export default router;
