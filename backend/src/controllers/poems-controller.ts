import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export const deletePoem = async (request: Request, response: Response) => {
  try {
    const { poemId } = request.params;
    
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
    
    // Delete all stanzas first (will cascade, but doing it explicitly for clarity)
    await prisma.stanza.deleteMany({
      where: {
        poemId
      }
    });
    
    // Delete the poem
    await prisma.poem.delete({
      where: {
        id: poemId
      }
    });
    
    response.status(204).send();
  } catch (error: any) {
    console.error("Error in deletePoem: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

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

// Get current user's own poems with cursor-based pagination
export const getMyPoems = async (request: Request, response: Response) => {
  try {
    const { cursor, limit = '10' } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Ensure reasonable limits
    const finalLimit = Math.min(Math.max(limitNum, 1), 50);

    // Base query
    const baseQuery = {
      where: {
        userId: request.user.id
      },
      include: {
        stanzas: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    };

    // Add cursor if provided
    const queryWithCursor = cursor
      ? {
          ...baseQuery,
          cursor: {
            id: cursor as string
          },
          skip: 1, // Skip the cursor item
        }
      : baseQuery;

    // Execute the query with pagination
    const poems = await prisma.poem.findMany({
      ...queryWithCursor,
      take: finalLimit + 1, // Take one extra to determine if there are more results
    });

    // Determine if there are more results and the next cursor
    const hasMore = poems.length > finalLimit;
    const paginatedPoems = hasMore ? poems.slice(0, finalLimit) : poems;
    const nextCursor = hasMore ? paginatedPoems[paginatedPoems.length - 1].id : null;

    // Get total count for reference (optional)
    const totalCount = await prisma.poem.count({
      where: {
        userId: request.user.id
      }
    });

    // Return the paginated response
    response.status(200).json({
      poems: paginatedPoems,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getMyPoems: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

// Get all poems from all users with cursor-based pagination
export const getAllPoems = async (request: Request, response: Response) => {
  try {
    const { cursor, limit = '10' } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Ensure reasonable limits
    const finalLimit = Math.min(Math.max(limitNum, 1), 50);

    // Base query
    const baseQuery = {
      include: {
        stanzas: true,
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    };

    // Add cursor if provided
    const queryWithCursor = cursor
      ? {
          ...baseQuery,
          cursor: {
            id: cursor as string
          },
          skip: 1, // Skip the cursor item
        }
      : baseQuery;

    // Execute the query with pagination
    const poems = await prisma.poem.findMany({
      ...queryWithCursor,
      take: finalLimit + 1, // Take one extra to determine if there are more results
    });

    // Determine if there are more results and the next cursor
    const hasMore = poems.length > finalLimit;
    const paginatedPoems = hasMore ? poems.slice(0, finalLimit) : poems;
    
    // Set isOwner flag for each poem
    const poemsWithOwnership = paginatedPoems.map(poem => ({
      ...poem,
      isOwner: poem.userId === request.user.id
    }));
    
    const nextCursor = hasMore ? paginatedPoems[paginatedPoems.length - 1].id : null;

    // Get total count for reference (optional)
    const totalCount = await prisma.poem.count();

    // Return the paginated response
    response.status(200).json({
      poems: poemsWithOwnership,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getAllPoems: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

// Get specific poem by ID - for owner only
export const getMyPoemById = async (request: Request, response: Response) => {
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
            position: 'asc'
          }
        }
      }
    });

    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }

    response.status(200).json(poem);
  } catch (error: any) {
    console.error("Error in getMyPoemById: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

// Get any poem by ID - for any user
export const getPoemById = async (request: Request, response: Response) => {
  try {
    const { poemId } = request.params;
    
    const poem = await prisma.poem.findUnique({
      where: {
        id: poemId
      },
      include: {
        stanzas: {
          orderBy: {
            position: 'asc'
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true,
          }
        }
      }
    });

    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }

    // Add flag to indicate if current user is the owner
    const isOwner = poem.userId === request.user.id;
    
    response.status(200).json({
      ...poem,
      isOwner
    });
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
      },
      include: {
        stanzas: true
      }
    });
    
    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }
    
    // Calculate the next position (max position + 1)
    const highestPosition = poem.stanzas.length === 0 
      ? -1 
      : Math.max(...poem.stanzas.map(s => s.position));
    
    const newStanza = await prisma.stanza.create({
      data: {
        poemId,
        body,
        position: highestPosition + 1
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
    
    // Reorder remaining stanzas to keep positions consecutive
    const poemStanzas = await prisma.stanza.findMany({
      where: {
        poemId: stanza.poemId
      },
      orderBy: {
        position: 'asc'
      }
    });
    
    // Update positions to be consecutive starting from 0
    for (let i = 0; i < poemStanzas.length; i++) {
      await prisma.stanza.update({
        where: { id: poemStanzas[i].id },
        data: { position: i }
      });
    }
    
    response.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteStanza: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

// Reorder stanzas endpoint
export const reorderStanzas = async (request: Request, response: Response) => {
  try {
    const { poemId } = request.params;
    const { stanzaIds } = request.body;
    
    if (!poemId || !stanzaIds || !Array.isArray(stanzaIds)) {
      return response.status(400).json({ error: "Poem ID and array of stanza IDs are required" });
    }
    
    // Verify the poem belongs to the user
    const poem = await prisma.poem.findUnique({
      where: {
        id: poemId,
        userId: request.user.id
      },
      include: {
        stanzas: true
      }
    });
    
    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }
    
    // Verify that all stanzaIds belong to this poem
    const poemStanzaIds = new Set(poem.stanzas.map(s => s.id));
    const allStanzasBelongToPoem = stanzaIds.every(id => poemStanzaIds.has(id));
    
    if (!allStanzasBelongToPoem) {
      return response.status(400).json({ error: "Some stanza IDs do not belong to this poem" });
    }
    
    // Verify the provided stanzaIds matches the count in DB
    if (stanzaIds.length !== poem.stanzas.length) {
      return response.status(400).json({ 
        error: "The number of stanza IDs provided does not match the number of stanzas in the poem"
      });
    }
    
    // Update positions based on the order in stanzaIds array
    for (let i = 0; i < stanzaIds.length; i++) {
      await prisma.stanza.update({
        where: { id: stanzaIds[i] },
        data: { position: i }
      });
    }
    
    // Get and return the updated poem with stanzas in new order
    const updatedPoem = await prisma.poem.findUnique({
      where: {
        id: poemId
      },
      include: {
        stanzas: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });
    
    response.status(200).json(updatedPoem);
  } catch (error: any) {
    console.error("Error in reorderStanzas: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}