import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { Prisma } from "@prisma/client";

// Get comments for a specific entity with pagination
export const getNotifications = async(request: Request, response: Response) => {
  try {
    const { cursor, limit = '10' } = request.query;

    // Parse limit to number and ensure it's reasonable
    const limitNum = parseInt(limit as string, 10) || 10;
    const finalLimit = Math.min(Math.max(limitNum, 1), 50); // Between 1 and 50

    // Base query
    const baseQuery = {
      where: {
        recipientId: request.user.id
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
    const notifications = await prisma.notification.findMany({
      ...queryWithCursor,
      take: finalLimit + 1, // Take one extra to determine if there are more results
    });

    // Determine if there are more results and the next cursor
    const hasMore = notifications.length > finalLimit;
    const paginatedNotifications = hasMore ? notifications.slice(0, finalLimit) : notifications;
    const nextCursor = hasMore ? paginatedNotifications[paginatedNotifications.length - 1].id : null;

    // Get total count
    const totalCount = await prisma.notification.count({
      where: {
        recipientId: request.user.id
      }
    });

    // Return the paginated response
    response.status(200).json({
      notifications: paginatedNotifications,
      nextCursor,
      totalCount
    });
  } catch (error: any) {
    console.error("Error in getNotifications: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

export const updateNotification = async(request: Request, response: Response) => {
  try {
    const { notificationId } = request.params;
    const { hasBeenRead } = request.body;

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
        recipientId: request.user.id
      }
    });

    if (!notification) {
      return response.status(404).json({ error: "Notification not found" });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        hasBeenRead: hasBeenRead === 'true'
      }
    });

    response.status(200).json(updatedNotification);
  } catch (error: any) {
    console.error("Error in updateNotification: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};

export const deleteNotification = async(request: Request, response: Response) => {
  try {
    const { notificationId } = request.params;

    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
        recipientId: request.user.id
      }
    });

    if (!notification) {
      return response.status(404).json({ error: "Notification not found" });
    }

    await prisma.notification.delete({
      where: {
        id: notificationId
      }
    });

    response.status(204).send();
  } catch (error: any) {
    console.error("Error in deleteNotification: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
};