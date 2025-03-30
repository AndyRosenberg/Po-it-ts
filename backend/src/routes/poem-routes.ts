import express from 'express';
import { protectRoute } from '../middleware/protect-route.js';
import { 
  createPoem, 
  createStanza, 
  deleteStanza, 
  getPoemById, 
  getPoems, 
  updatePoemTitle,
  updateStanza 
} from '../controllers/poems-controller.js';

const router = express.Router();

// Poem routes
router.get("/poems", protectRoute, getPoems);
router.post("/poems", protectRoute, createPoem);
router.get("/poems/:poemId", protectRoute, getPoemById);
router.put("/poems/:poemId/title", protectRoute, updatePoemTitle);

// Stanza routes
router.post("/stanzas", protectRoute, createStanza);
router.put("/stanzas/:stanzaId", protectRoute, updateStanza);
router.delete("/stanzas/:stanzaId", protectRoute, deleteStanza);

export default router;