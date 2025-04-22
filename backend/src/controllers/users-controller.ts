import { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import bcryptjs from "bcryptjs";
import { isValidEmail } from '../utils/validation.js';

export const getUserById = async(request: Request, response: Response) => {
  try {
    const { userId } = request.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            poems: true
          }
        }
      }
    });

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    response.status(200).json(user);
  } catch (_error: any) {
    response.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUser = async(request: Request, response: Response) => {
  try {
    const { username, email, password, currentPassword } = request.body;
    const userId = request.user.id;

    // Get current user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    // If attempting to change password, verify current password
    if (password && currentPassword) {
      const isPasswordCorrect = await bcryptjs.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return response.status(400).json({ error: "Current password is incorrect" });
      }
    }

    // Check if new username is unique and not in email format
    if (username && username !== user.username) {
      // Validate that username doesn't look like an email
      if (isValidEmail(username)) {
        return response.status(400).json({ error: "Username cannot be in email format" });
      }

      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return response.status(400).json({ error: "Username already exists" });
      }
    }

    // Check if new email is unique
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return response.status(400).json({ error: "Email already exists" });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    response.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePic: updatedUser.profilePic
    });
  } catch (_error: any) {
    response.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteUser = async(request: Request, response: Response) => {
  try {
    const userId = request.user.id;
    const { password } = request.body;

    // Get current user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    // Verify password before deletion
    if (!password) {
      return response.status(400).json({ error: "Password is required to delete account" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return response.status(400).json({ error: "Password is incorrect" });
    }

    // Delete user and all related data using transactions
    await prisma.$transaction(async(prismaClient) => {
      // Delete user's poems and related comments
      const poems = await prismaClient.poem.findMany({
        where: { userId },
        select: { id: true }
      });

      const poemIds = poems.map(poem => poem.id);

      // Delete user's comments on other poems
      await prismaClient.comment.deleteMany({
        where: { userId }
      });

      await prismaClient.stanza.deleteMany({
        where: {
          poemId: { in: poemIds }
        }
      });

      await prismaClient.poem.deleteMany({
        where: { userId }
      });

      await prismaClient.follow.deleteMany({
        where: {
          OR: [
            { A: userId },
            { B: userId }
          ]
        }
      });

      await prismaClient.user.delete({
        where: { id: userId }
      });
    });

    response.status(200).json({ message: "Account successfully deleted" });
  } catch (error: any) {
    // We're keeping this error as non-prefixed since we need to log it
    console.error("Error deleting user:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};
