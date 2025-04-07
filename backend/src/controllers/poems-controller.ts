import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { Prisma } from "@prisma/client";

// Get poems by a specific user with cursor-based pagination and search
export const getUserPoems = async (request: Request, response: Response) => {
  try {
    const { userId } = request.params;
    const { cursor, limit = '10', search } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    const finalLimit: number = Math.min(Math.max(limitNum, 1), 50);
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }
    
    // Base where clause
    let whereClause: any = { userId };
    let isSearchQuery = false;

    // Add search criteria if provided
    if (search && typeof search === 'string' && search.trim()) {
      isSearchQuery = true;
      whereClause = {
        AND: [
          { userId },
          {
            OR: [
              {
                title: {
                  contains: search.trim(),
                  mode: 'insensitive'
                }
              },
              {
                stanzas: {
                  some: {
                    body: {
                      contains: search.trim(),
                      mode: 'insensitive'
                    }
                  }
                }
              }
            ]
          }
        ]
      };
    }
    
    // Base query
    const baseQuery = {
      where: whereClause,
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
        updatedAt: Prisma.SortOrder.desc
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
    
    // Add flag to indicate if current user is the owner
    const isCurrentUserOwner = !!request.user && request.user.id === userId;
    const poemsWithOwnership = paginatedPoems.map(poem => ({
      ...poem,
      isOwner: isCurrentUserOwner
    }));

    // Get total count for reference
    const totalCount = await prisma.poem.count({
      where: whereClause
    });
    
    // Add search match information
    let poemsWithSearchMatches = poemsWithOwnership;
    
    if (isSearchQuery && search) {
      const searchTerm = search.toString().trim().toLowerCase();
      
      poemsWithSearchMatches = poemsWithOwnership.map(poem => {
        // Find matches in title
        const titleMatch = poem.title.toLowerCase().includes(searchTerm);
        
        // Find matches in stanzas
        const matchingStanzas = poem.stanzas
          .filter(stanza => stanza.body.toLowerCase().includes(searchTerm))
          .map(stanza => {
            // Get a snippet of text around the match
            const stanzaText = stanza.body;
            const matchIndex = stanzaText.toLowerCase().indexOf(searchTerm);
            
            // Get context around the match (up to 50 chars before and after)
            const startIndex = Math.max(0, matchIndex - 50);
            const endIndex = Math.min(stanzaText.length, matchIndex + searchTerm.length + 50);
            let snippet = stanzaText.substring(startIndex, endIndex);
            
            // Add ellipsis if we trimmed the text
            if (startIndex > 0) snippet = '...' + snippet;
            if (endIndex < stanzaText.length) snippet = snippet + '...';
            
            return {
              id: stanza.id,
              position: stanza.position,
              snippet,
              matchIndex: matchIndex - startIndex + (startIndex > 0 ? 3 : 0) // Adjust for ellipsis
            };
          });
        
        return {
          ...poem,
          searchMatches: {
            titleMatch,
            matchingStanzas
          }
        };
      });
    }

    // Return the paginated response
    response.status(200).json({
      poems: poemsWithSearchMatches,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getUserPoems: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

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

// Get current user's own poems with cursor-based pagination and fuzzy search
export const getMyPoems = async (request: Request, response: Response) => {
  try {
    const { cursor, limit = '10', search } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Ensure reasonable limits
    const finalLimit: number = Math.min(Math.max(limitNum, 1), 50);

    // Base query
    let whereClause: any = {
      userId: request.user.id
    };
    
    let isSearchQuery = false;

    // Add search criteria if provided
    if (search && typeof search === 'string' && search.trim()) {
      isSearchQuery = true;
      // Use PostgreSQL's trigram similarity for fuzzy matching
      whereClause = {
        ...whereClause,
        OR: [
          {
            title: {
              contains: search.trim(),
              mode: 'insensitive'
            }
          },
          {
            stanzas: {
              some: {
                body: {
                  contains: search.trim(),
                  mode: 'insensitive'
                }
              }
            }
          }
        ]
      };
    }

    // Base query
    const baseQuery = {
      where: whereClause,
      include: {
        stanzas: true
      },
      orderBy: {
        updatedAt: Prisma.SortOrder.desc
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
      where: whereClause
    });
    
    // Add search match information
    let poemsWithSearchMatches = paginatedPoems;
    
    if (isSearchQuery && search) {
      const searchTerm = search.toString().trim().toLowerCase();
      
      poemsWithSearchMatches = paginatedPoems.map(poem => {
        // Find matches in title
        const titleMatch = poem.title.toLowerCase().includes(searchTerm);
        
        // Find matches in stanzas
        const matchingStanzas = poem.stanzas
          .filter(stanza => stanza.body.toLowerCase().includes(searchTerm))
          .map(stanza => {
            // Get a snippet of text around the match
            const stanzaText = stanza.body;
            const matchIndex = stanzaText.toLowerCase().indexOf(searchTerm);
            
            // Get context around the match (up to 50 chars before and after)
            const startIndex = Math.max(0, matchIndex - 50);
            const endIndex = Math.min(stanzaText.length, matchIndex + searchTerm.length + 50);
            let snippet = stanzaText.substring(startIndex, endIndex);
            
            // Add ellipsis if we trimmed the text
            if (startIndex > 0) snippet = '...' + snippet;
            if (endIndex < stanzaText.length) snippet = snippet + '...';
            
            return {
              id: stanza.id,
              position: stanza.position,
              snippet,
              matchIndex: matchIndex - startIndex + (startIndex > 0 ? 3 : 0) // Adjust for ellipsis
            };
          });
        
        return {
          ...poem,
          searchMatches: {
            titleMatch,
            matchingStanzas
          }
        };
      });
    }

    // Return the paginated response
    response.status(200).json({
      poems: poemsWithSearchMatches,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getMyPoems: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

// Get all poems from all users with cursor-based pagination and fuzzy search
export const getAllPoems = async (request: Request, response: Response) => {
  try {
    const { cursor, limit = '10', search } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    // Ensure reasonable limits
    const finalLimit: number = Math.min(Math.max(limitNum, 1), 50);

    // Base where clause
    let whereClause: any = {};
    
    let isSearchQuery = false;

    // Add search criteria if provided
    if (search && typeof search === 'string' && search.trim()) {
      isSearchQuery = true;
      // Use PostgreSQL's trigram similarity for fuzzy matching
      whereClause = {
        OR: [
          {
            title: {
              contains: search.trim(),
              mode: 'insensitive'
            }
          },
          {
            stanzas: {
              some: {
                body: {
                  contains: search.trim(),
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            user: {
              username: {
                contains: search.trim(),
                mode: 'insensitive'
              }
            }
          }
        ]
      };
    }

    // Base query
    const baseQuery = {
      where: whereClause,
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
        updatedAt: Prisma.SortOrder.desc
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
    const totalCount = await prisma.poem.count({
      where: whereClause
    });
    
    // Add search match information
    let poemsWithSearchMatches = poemsWithOwnership;
    
    if (isSearchQuery && search) {
      const searchTerm = search.toString().trim().toLowerCase();
      
      poemsWithSearchMatches = poemsWithOwnership.map(poem => {
        // Find matches in title
        const titleMatch = poem.title.toLowerCase().includes(searchTerm);
        
        // Find matches in username
        const usernameMatch = poem.user && poem.user.username.toLowerCase().includes(searchTerm);
        
        // Find matches in stanzas
        const matchingStanzas = poem.stanzas
          .filter(stanza => stanza.body.toLowerCase().includes(searchTerm))
          .map(stanza => {
            // Get a snippet of text around the match
            const stanzaText = stanza.body;
            const matchIndex = stanzaText.toLowerCase().indexOf(searchTerm);
            
            // Get context around the match (up to 50 chars before and after)
            const startIndex = Math.max(0, matchIndex - 50);
            const endIndex = Math.min(stanzaText.length, matchIndex + searchTerm.length + 50);
            let snippet = stanzaText.substring(startIndex, endIndex);
            
            // Add ellipsis if we trimmed the text
            if (startIndex > 0) snippet = '...' + snippet;
            if (endIndex < stanzaText.length) snippet = snippet + '...';
            
            return {
              id: stanza.id,
              position: stanza.position,
              snippet,
              matchIndex: matchIndex - startIndex + (startIndex > 0 ? 3 : 0) // Adjust for ellipsis
            };
          });
        
        return {
          ...poem,
          searchMatches: {
            titleMatch,
            usernameMatch,
            matchingStanzas
          }
        };
      });
    }

    // Return the paginated response
    response.status(200).json({
      poems: poemsWithSearchMatches,
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
            position: Prisma.SortOrder.asc
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
            position: Prisma.SortOrder.asc
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
        position: Prisma.SortOrder.asc
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
            position: Prisma.SortOrder.asc
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

// Get poems for user's feed (poems from followed users)
export const getFeedPoems = async (request: Request, response: Response) => {
  try {
    const { cursor, limit = '10', search } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    const finalLimit: number = Math.min(Math.max(limitNum, 1), 50);

    // Get users that the current user follows
    const currentUser = await prisma.user.findUnique({
      where: { id: request.user.id },
      include: {
        following: {
          select: { id: true }
        }
      }
    });

    if (!currentUser) {
      return response.status(404).json({ error: "User not found" });
    }

    // Get IDs of users that the current user follows
    // Include the current user's ID to show their own poems too
    const userIdsForFeed = [...currentUser.following.map(user => user.id), currentUser.id];
    
    // Base where clause to get poems from followed users and the user's own poems
    let whereClause: any = {
      userId: {
        in: userIdsForFeed
      }
    };
    
    let isSearchQuery = false;

    // Add search criteria if provided
    if (search && typeof search === 'string' && search.trim()) {
      isSearchQuery = true;
      whereClause = {
        AND: [
          { userId: { in: userIdsForFeed } },
          {
            OR: [
              {
                title: {
                  contains: search.trim(),
                  mode: 'insensitive'
                }
              },
              {
                stanzas: {
                  some: {
                    body: {
                      contains: search.trim(),
                      mode: 'insensitive'
                    }
                  }
                }
              },
              {
                user: {
                  username: {
                    contains: search.trim(),
                    mode: 'insensitive'
                  }
                }
              }
            ]
          }
        ]
      };
    }

    // Base query similar to getAllPoems
    const baseQuery = {
      where: whereClause,
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
        updatedAt: Prisma.SortOrder.desc
      }
    };

    // Add cursor if provided
    const queryWithCursor = cursor
      ? {
          ...baseQuery,
          cursor: {
            id: cursor as string
          },
          skip: 1,
        }
      : baseQuery;

    // Execute the query with pagination
    const poems = await prisma.poem.findMany({
      ...queryWithCursor,
      take: finalLimit + 1,
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

    // Get total count for reference
    const totalCount = await prisma.poem.count({
      where: whereClause
    });
    
    // Add search match information
    let poemsWithSearchMatches = poemsWithOwnership;
    
    if (isSearchQuery && search) {
      const searchTerm = search.toString().trim().toLowerCase();
      
      poemsWithSearchMatches = poemsWithOwnership.map(poem => {
        // Find matches in title
        const titleMatch = poem.title.toLowerCase().includes(searchTerm);
        
        // Find matches in username
        const usernameMatch = poem.user && poem.user.username.toLowerCase().includes(searchTerm);
        
        // Find matches in stanzas
        const matchingStanzas = poem.stanzas
          .filter(stanza => stanza.body.toLowerCase().includes(searchTerm))
          .map(stanza => {
            // Get a snippet of text around the match
            const stanzaText = stanza.body;
            const matchIndex = stanzaText.toLowerCase().indexOf(searchTerm);
            
            // Get context around the match (up to 50 chars before and after)
            const startIndex = Math.max(0, matchIndex - 50);
            const endIndex = Math.min(stanzaText.length, matchIndex + searchTerm.length + 50);
            let snippet = stanzaText.substring(startIndex, endIndex);
            
            // Add ellipsis if we trimmed the text
            if (startIndex > 0) snippet = '...' + snippet;
            if (endIndex < stanzaText.length) snippet = snippet + '...';
            
            return {
              id: stanza.id,
              position: stanza.position,
              snippet,
              matchIndex: matchIndex - startIndex + (startIndex > 0 ? 3 : 0) // Adjust for ellipsis
            };
          });
        
        return {
          ...poem,
          searchMatches: {
            titleMatch,
            usernameMatch,
            matchingStanzas
          }
        };
      });
    }

    // Return the paginated response
    response.status(200).json({
      poems: poemsWithSearchMatches,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getFeedPoems: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}