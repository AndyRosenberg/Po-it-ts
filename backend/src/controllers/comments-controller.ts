import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { Prisma } from "@prisma/client";

// Create a comment
export const createComment = async(request: Request, response: Response) => {
  try {
    const { body, commentableType, commentableId } = request.body;

    if (!body || !commentableType || !commentableId) {
      return response.status(400).json({
        error: "Comment body, commentable type, and commentable ID are required"
      });
    }

    // Validate that the commentable entity exists
    if (commentableType === "Stanza") {
      const stanza = await prisma.stanza.findUnique({
        where: { id: commentableId }
      });

      if (!stanza) {
        return response.status(404).json({ error: "Stanza not found" });
      }
    } else {
      return response.status(400).json({
        error: "Invalid commentable type. Currently only 'Stanza' is supported."
      });
    }

    const newComment = await prisma.comment.create({
      data: {
        body,
        commentableType,
        commentableId,
        userId: request.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true
          }
        }
      }
    });

    response.status(201).json(newComment);
  } catch (error: any) {
    console.error("Error in createComment: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Get comments for a specific entity with pagination
export const getComments = async(request: Request, response: Response) => {
  try {
    const { commentableType, commentableId } = request.params;
    const { cursor, limit = '10' } = request.query;

    if (!commentableType || !commentableId) {
      return response.status(400).json({
        error: "Commentable type and ID are required"
      });
    }

    // Validate commentableType
    if (commentableType !== "Stanza") {
      return response.status(400).json({
        error: "Invalid commentable type. Currently only 'Stanza' is supported."
      });
    }

    // Parse limit to number and ensure it's reasonable
    const limitNum = parseInt(limit as string, 10) || 10;
    const finalLimit = Math.min(Math.max(limitNum, 1), 50); // Between 1 and 50

    // Base query
    const baseQuery = {
      where: {
        commentableType,
        commentableId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true
          }
        }
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc
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
    const comments = await prisma.comment.findMany({
      ...queryWithCursor,
      take: finalLimit + 1, // Take one extra to determine if there are more results
    });

    // Determine if there are more results and the next cursor
    const hasMore = comments.length > finalLimit;
    const paginatedComments = hasMore ? comments.slice(0, finalLimit) : comments;
    const nextCursor = hasMore ? paginatedComments[paginatedComments.length - 1].id : null;

    // Get total count
    const totalCount = await prisma.comment.count({
      where: {
        commentableType,
        commentableId
      }
    });

    // Return the paginated response
    response.status(200).json({
      comments: paginatedComments,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getComments: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Update a comment
export const updateComment = async(request: Request, response: Response) => {
  try {
    const { commentId } = request.params;
    const { body } = request.body;

    if (!body) {
      return response.status(400).json({ error: "Comment body is required" });
    }

    // Verify the comment belongs to the user
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
        userId: request.user.id
      }
    });

    if (!comment) {
      return response.status(404).json({ error: "Comment not found or you don't have permission to update it" });
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId
      },
      data: {
        body
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true
          }
        }
      }
    });

    response.status(200).json(updatedComment);
  } catch (error: any) {
    console.error("Error in updateComment: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

// Delete a comment
export const deleteComment = async(request: Request, response: Response) => {
  try {
    const { commentId } = request.params;

    // Verify the comment belongs to the user
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
        userId: request.user.id
      }
    });

    if (!comment) {
      return response.status(404).json({ error: "Comment not found or you don't have permission to delete it" });
    }

    await prisma.comment.delete({
      where: {
        id: commentId
      }
    });

    response.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteComment: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};