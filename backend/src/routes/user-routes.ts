import express from 'express';
import { updateUser } from '../controllers/users-controller.js';
import { protectRoute } from '../middleware/protect-route.js';

const router = express.Router();

router.put("/update", protectRoute, updateUser);

export default router;