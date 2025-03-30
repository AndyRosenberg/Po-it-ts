import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export const createPoem = async (request: Request, response: Response) => {
  try {
    const { title } = request.body;
    
    const newPoem = await prisma.poem.create({
      data: {
        userId: request.user.id,
        ...(title ? { title } : {})
      }
    });

    response.status(201).json(newPoem);
  } catch (error: any) {
    console.error("Error in createPoem: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const getPoems = async (request: Request, response: Response) => {
  try {
    const poems = await prisma.poem.findMany({
      where: {
        userId: request.user.id
      },
      include: {
        stanzas: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!poems) {
      return response.status(200).json([]);
    }

    response.status(200).json(poems);
  } catch (error: any) {
    console.error("Error in getPoems: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const getPoemById = async (request: Request, response: Response) => {
  try {
    const { poemId } = request.params;
    
    const poem = await prisma.poem.findUnique({
      where: {
        id: poemId,
        userId: request.user.id
      },
      include: {
        stanzas: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }

    response.status(200).json(poem);
  } catch (error: any) {
    console.error("Error in getPoemById: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const updatePoemTitle = async (request: Request, response: Response) => {
  try {
    const { poemId } = request.params;
    const { title } = request.body;
    
    if (!title || typeof title !== 'string') {
      return response.status(400).json({ error: "Title is required" });
    }
    
    const poem = await prisma.poem.findUnique({
      where: {
        id: poemId,
        userId: request.user.id
      }
    });
    
    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }
    
    const updatedPoem = await prisma.poem.update({
      where: {
        id: poemId
      },
      data: {
        title
      }
    });
    
    response.status(200).json(updatedPoem);
  } catch (error: any) {
    console.error("Error in updatePoemTitle: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const createStanza = async (request: Request, response: Response) => {
  try {
    const { poemId, body } = request.body;
    
    if (!poemId || !body) {
      return response.status(400).json({ error: "Poem ID and stanza body are required" });
    }
    
    // Verify the poem belongs to the user
    const poem = await prisma.poem.findUnique({
      where: {
        id: poemId,
        userId: request.user.id
      }
    });
    
    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }
    
    const newStanza = await prisma.stanza.create({
      data: {
        poemId,
        body
      }
    });
    
    response.status(201).json(newStanza);
  } catch (error: any) {
    console.error("Error in createStanza: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const updateStanza = async (request: Request, response: Response) => {
  try {
    const { stanzaId } = request.params;
    const { body } = request.body;
    
    if (!body) {
      return response.status(400).json({ error: "Stanza body is required" });
    }
    
    // Verify the stanza belongs to one of the user's poems
    const stanza = await prisma.stanza.findUnique({
      where: {
        id: stanzaId
      },
      include: {
        poem: true
      }
    });
    
    if (!stanza || stanza.poem.userId !== request.user.id) {
      return response.status(404).json({ error: "Stanza not found" });
    }
    
    const updatedStanza = await prisma.stanza.update({
      where: {
        id: stanzaId
      },
      data: {
        body
      }
    });
    
    response.status(200).json(updatedStanza);
  } catch (error: any) {
    console.error("Error in updateStanza: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const deleteStanza = async (request: Request, response: Response) => {
  try {
    const { stanzaId } = request.params;
    
    // Verify the stanza belongs to one of the user's poems
    const stanza = await prisma.stanza.findUnique({
      where: {
        id: stanzaId
      },
      include: {
        poem: true
      }
    });
    
    if (!stanza || stanza.poem.userId !== request.user.id) {
      return response.status(404).json({ error: "Stanza not found" });
    }
    
    await prisma.stanza.delete({
      where: {
        id: stanzaId
      }
    });
    
    response.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteStanza: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}