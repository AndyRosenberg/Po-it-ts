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
  updatePoemTitle,
  updateStanza,
  reorderStanzas,
  getUserPoems
} from '../controllers/poems-controller.js';

const router = express.Router();

// Poem routes - private (user's own poems)
router.get("/my-poems", protectRoute, getMyPoems);
router.get("/my-poems/:poemId", protectRoute, getMyPoemById);

// Poem routes - public (all poems)
router.get("/poems", protectRoute, getAllPoems);
router.get("/poems/:poemId", protectRoute, getPoemById);
router.get("/poems/user/:userId", protectRoute, getUserPoems);

// Poem creation and modification
router.post("/poems", protectRoute, createPoem);
router.put("/poems/:poemId/title", protectRoute, updatePoemTitle);
router.put("/poems/:poemId/reorder", protectRoute, reorderStanzas);
router.delete("/poems/:poemId", protectRoute, deletePoem);

// Stanza routes
router.post("/stanzas", protectRoute, createStanza);
router.put("/stanzas/:stanzaId", protectRoute, updateStanza);
router.delete("/stanzas/:stanzaId", protectRoute, deleteStanza);

export default router;