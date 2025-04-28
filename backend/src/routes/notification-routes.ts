import express from "express";
import { protectRoute } from "../middleware/protect-route.js";
import { deleteNotification, getNotifications, updateNotification } from "../controllers/notifications-controller.js";

const router = express.Router();

// Route middleware to protect all comment routes
router.use(protectRoute);

// Get comments for an entity (like a stanza)
router.get("/", getNotifications);

// Update a comment
router.put("/:notificationId", updateNotification);

// Delete a comment
router.delete("/:notificationId", deleteNotification);

export default router;