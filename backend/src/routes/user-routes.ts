import express from 'express';
import { updateUser, getUserById, deleteUser } from '../controllers/users-controller.js';
import { protectRoute } from '../middleware/protect-route.js';

const router = express.Router();

// Protected routes
router.put("/update", protectRoute, updateUser);
router.delete("/delete", protectRoute, deleteUser);

// Public routes
router.get("/:userId", getUserById);

export default router;