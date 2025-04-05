import express from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing, checkFollowing } from '../controllers/follows-controller.js';
import { protectRoute } from '../middleware/protect-route.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/:followingId', protectRoute, followUser);
router.delete('/:followingId', protectRoute, unfollowUser);
router.get('/check/:userId', protectRoute, checkFollowing);

// Public routes
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

export default router;