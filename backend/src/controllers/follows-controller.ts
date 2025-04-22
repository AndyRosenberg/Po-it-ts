import { Request, Response } from 'express';
import prisma from '../db/prisma.js';

// Follow a user
export const followUser = async(req: Request, res: Response) => {
  try {
    const followerId = req.user.id; // Current user
    const { followingId } = req.params; // User to follow

    // Check if users exist
    const follower = await prisma.user.findUnique({ where: { id: followerId } });
    const following = await prisma.user.findUnique({ where: { id: followingId } });

    if (!follower || !following) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: followerId,
        following: {
          some: {
            id: followingId
          }
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // Create follow relationship
    await prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          connect: { id: followingId }
        }
      }
    });

    res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Unfollow a user
export const unfollowUser = async(req: Request, res: Response) => {
  try {
    const followerId = req.user.id; // Current user
    const { followingId } = req.params; // User to unfollow

    // Check if users exist
    const follower = await prisma.user.findUnique({ where: { id: followerId } });
    const following = await prisma.user.findUnique({ where: { id: followingId } });

    if (!follower || !following) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const existingFollow = await prisma.user.findFirst({
      where: {
        id: followerId,
        following: {
          some: {
            id: followingId
          }
        }
      }
    });

    if (!existingFollow) {
      return res.status(400).json({ error: "Not following this user" });
    }

    // Remove follow relationship
    await prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          disconnect: { id: followingId }
        }
      }
    });

    res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get followers of a user
export const getFollowers = async(req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        followers: {
          select: {
            id: true,
            username: true,
            profilePic: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get users that a user is following
export const getFollowing = async(req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            profilePic: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.following);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Check if current user is following another user
export const checkFollowing = async(req: Request, res: Response) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    const follow = await prisma.user.findFirst({
      where: {
        id: followerId,
        following: {
          some: {
            id: userId
          }
        }
      }
    });

    res.status(200).json({ isFollowing: !!follow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};