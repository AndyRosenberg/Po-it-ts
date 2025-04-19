import express from 'express';
import { protectRoute } from '../middleware/protect-route.js';
import { 
  createPoem, 
  createStanza, 
  deletePoem,
  deleteStanza, 
  getAllPoems,
  getPoemById, 
  getMyPoemById,
  getMyPoems,
  getFeedPoems,
  updatePoemTitle,
  updateStanza,
  reorderStanzas,
  publishPoem,
  convertToDraft,
  getUserPoems
} from '../controllers/poems-controller.js';

const router = express.Router();

// Poem routes - private (user's own poems)
router.get("/my-poems", protectRoute, getMyPoems);
router.get("/my-poems/:poemId", protectRoute, getMyPoemById);
router.get("/feed", protectRoute, getFeedPoems);

// Poem routes - public (all poems)
router.get("/poems", protectRoute, getAllPoems);
// User poems route must come before generic poemId route
router.get("/poems/user/:userId", protectRoute, getUserPoems);
router.get("/poems/:poemId", protectRoute, getPoemById);

// Poem creation and modification
router.post("/poems", protectRoute, createPoem);
router.put("/poems/:poemId/title", protectRoute, updatePoemTitle);
router.put("/poems/:poemId/reorder", protectRoute, reorderStanzas);
router.put("/poems/:poemId/publish", protectRoute, publishPoem);
router.put("/poems/:poemId/draft", protectRoute, convertToDraft);
router.delete("/poems/:poemId", protectRoute, deletePoem);

// Stanza routes
router.post("/stanzas", protectRoute, createStanza);
router.put("/stanzas/:stanzaId", protectRoute, updateStanza);
router.delete("/stanzas/:stanzaId", protectRoute, deleteStanza);

export default router;