import express from 'express';
import { login, logout, signup, getMe } from '../controllers/auth-controller.js';
import { protectRoute } from '../middleware/protect-route.js';

const router = express.Router();

router.get("/me", protectRoute, getMe);

router.post("/login", login);

router.post("/logout", logout);

router.post("/signup", signup);

export default router;
