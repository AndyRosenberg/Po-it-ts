import express from 'express';
import { protectRoute } from '../middleware/protect-route.js';
import { getPoems } from '../controllers/poems-controller.js';

const router = express.Router();

router.get("/conversations", protectRoute, getPoems);

export default router;