import express from "express";
import { 
  createComment, 
  getComments, 
  updateComment, 
  deleteComment 
} from "../controllers/comments-controller.js";
import { protectRoute } from "../middleware/protect-route.js";

const router = express.Router();

// Route middleware to protect all comment routes
router.use(protectRoute);

// Create a comment
router.post("/", createComment);

// Get comments for an entity (like a stanza)
router.get("/:commentableType/:commentableId", getComments);

// Update a comment
router.put("/:commentId", updateComment);

// Delete a comment
router.delete("/:commentId", deleteComment);

export default router;