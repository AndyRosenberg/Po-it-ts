import express from 'express';
import { updateUser, getUserById } from '../controllers/users-controller.js';
import { protectRoute } from '../middleware/protect-route.js';

const router = express.Router();

// Protected routes
router.put("/update", protectRoute, updateUser);

// Public routes
router.get("/:userId", getUserById);

export default router;