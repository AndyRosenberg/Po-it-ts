import express from 'express';
import { protectRoute } from '../middleware/protect-route.js';
import {
  getUserCollections,
  getPoemCollectionsCount,
  checkPoemPinned,
  pinPoem,
  unpinPoem
} from '../controllers/collections-controller.js';

const router = express.Router();

// Public routes
router.get("/users/:userId/collections", protectRoute, getUserCollections);
router.get("/poems/:poemId/pins-count", protectRoute, getPoemCollectionsCount);
router.get("/poems/:poemId/is-pinned", protectRoute, checkPoemPinned);

// Protected routes
router.post("/poems/:poemId/pin", protectRoute, pinPoem);
router.delete("/pins/:pinId", protectRoute, unpinPoem);

export default router;