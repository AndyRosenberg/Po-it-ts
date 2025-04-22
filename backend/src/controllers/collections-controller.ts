import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { Prisma } from "@prisma/client";

// Get collections for a specific user
export const getUserCollections = async(request: Request, response: Response) => {
  try {
    const { userId } = request.params;
    const { cursor, limit = '10', search } = request.query;
    const limitNum = parseInt(limit as string, 10) || 10;
    const finalLimit: number = Math.min(Math.max(limitNum, 1), 50);

    // Process search term if provided
    const searchTerm = search && typeof search === 'string' ? search.trim().toLowerCase() : '';
    const isSearchQuery = !!searchTerm;

    // For search queries, we need a different approach to search across poem titles
    if (isSearchQuery) {
      // Step 1: Get all collections for this user that are poems (without pagination)
      const userCollections = await prisma.collection.findMany({
        where: {
          userId: userId,
          collectableType: 'Poem'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: Prisma.SortOrder.desc
        }
      });

      // Step 2: Fetch all poem details for these collections to enable search
      const collectionsWithPoems = await Promise.all(
        userCollections.map(async(collection) => {
          const poem = await prisma.poem.findUnique({
            where: { id: collection.collectableId },
            select: {
              id: true,
              title: true,
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          });

          return {
            ...collection,
            poem: poem || { id: '', title: 'Unknown Poem', user: { id: '', username: '' } }
          };
        })
      );

      // Step 3: Filter collections by search term
      const filteredCollections = collectionsWithPoems.filter(collection => {
        // Search in poem title
        const titleMatch = collection.poem?.title?.toLowerCase().includes(searchTerm);
        // Search in poet username
        const usernameMatch = collection.poem?.user?.username?.toLowerCase().includes(searchTerm);

        return titleMatch || usernameMatch;
      });

      // Step 4: Apply cursor-based pagination manually
      let startIndex = 0;
      if (cursor) {
        const cursorIndex = filteredCollections.findIndex(c => c.id === cursor);
        startIndex = cursorIndex !== -1 ? cursorIndex + 1 : 0;
      }

      // Get items for the current page plus one extra for pagination
      const paginationSlice = filteredCollections.slice(startIndex, startIndex + finalLimit + 1);

      // Handle pagination
      const hasMore = paginationSlice.length > finalLimit;
      const paginatedCollections = hasMore ? paginationSlice.slice(0, finalLimit) : paginationSlice;
      const nextCursor = hasMore ? paginationSlice[finalLimit - 1].id : null;

      // Return the filtered and paginated results
      return response.status(200).json({
        collections: paginatedCollections,
        nextCursor,
        totalCount: filteredCollections.length
      });
    }

    // Regular non-search query with standard pagination
    const whereClause: any = { userId: userId };

    // Base query
    const baseQuery = {
      where: whereClause,
      orderBy: {
        createdAt: Prisma.SortOrder.desc
      }
    };

    // Add cursor pagination
    const queryWithCursor = cursor
      ? {
        ...baseQuery,
        cursor: { id: cursor as string },
        skip: 1, // Skip the cursor item
      }
      : baseQuery;

    // Execute the query
    const collections = await prisma.collection.findMany({
      ...queryWithCursor,
      take: finalLimit + 1,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    // For collections that are of type 'Poem', fetch the poem titles
    const collectionsWithDetails = await Promise.all(
      collections.map(async(collection) => {
        if (collection.collectableType === 'Poem') {
          const poem = await prisma.poem.findUnique({
            where: { id: collection.collectableId },
            select: {
              title: true,
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          });

          return {
            ...collection,
            poem: poem || { title: 'Unknown Poem', user: { username: '' } }
          };
        }
        return collection;
      })
    );

    // Handle pagination
    const hasMore = collections.length > finalLimit;
    const paginatedCollections = hasMore ? collectionsWithDetails.slice(0, finalLimit) : collectionsWithDetails;
    const nextCursor = hasMore ? collections[finalLimit - 1].id : null;

    // Return response
    response.status(200).json({
      collections: paginatedCollections,
      nextCursor,
      totalCount: await prisma.collection.count({ where: whereClause })
    });
  } catch (error: any) {
    console.error("Error in getUserCollections: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Get poem collections (pins) count
export const getPoemCollectionsCount = async(request: Request, response: Response) => {
  try {
    const { poemId } = request.params;

    const count = await prisma.collection.count({
      where: {
        collectableId: poemId,
        collectableType: 'Poem'
      }
    });

    response.status(200).json({ count });
  } catch (error: any) {
    console.error("Error in getPoemCollectionsCount: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Check if current user has pinned a poem
export const checkPoemPinned = async(request: Request, response: Response) => {
  try {
    const { poemId } = request.params;

    if (!request.user) {
      return response.status(200).json({ isPinned: false });
    }

    const pin = await prisma.collection.findFirst({
      where: {
        userId: request.user.id,
        collectableId: poemId,
        collectableType: 'Poem'
      }
    });

    response.status(200).json({
      isPinned: !!pin,
      pinId: pin?.id || null
    });
  } catch (error: any) {
    console.error("Error in checkPoemPinned: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Add a poem to collection (pin it)
export const pinPoem = async(request: Request, response: Response) => {
  try {
    const { poemId } = request.params;

    if (!request.user) {
      return response.status(401).json({ error: "Authentication required" });
    }

    // Verify the poem exists
    const poem = await prisma.poem.findUnique({
      where: { id: poemId },
      select: { id: true, userId: true }
    });

    if (!poem) {
      return response.status(404).json({ error: "Poem not found" });
    }

    // Users shouldn't pin their own poems
    if (poem.userId === request.user.id) {
      return response.status(400).json({ error: "Cannot pin your own poem" });
    }

    // Check if already pinned
    const existingPin = await prisma.collection.findFirst({
      where: {
        userId: request.user.id,
        collectableId: poemId,
        collectableType: 'Poem'
      }
    });

    if (existingPin) {
      return response.status(400).json({ error: "Poem already pinned" });
    }

    // Create pin
    const newPin = await prisma.collection.create({
      data: {
        userId: request.user.id,
        collectableId: poemId,
        collectableType: 'Poem'
      }
    });

    response.status(201).json(newPin);
  } catch (error: any) {
    console.error("Error in pinPoem: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Remove poem from collection (unpin it)
export const unpinPoem = async(request: Request, response: Response) => {
  try {
    const { pinId } = request.params;

    if (!request.user) {
      return response.status(401).json({ error: "Authentication required" });
    }

    // Verify ownership
    const pin = await prisma.collection.findFirst({
      where: {
        id: pinId,
        userId: request.user.id
      }
    });

    if (!pin) {
      return response.status(404).json({ error: "Pin not found" });
    }

    // Delete the pin
    await prisma.collection.delete({
      where: {
        id: pinId
      }
    });

    response.status(204).send();
  } catch (error: any) {
    console.error("Error in unpinPoem: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};