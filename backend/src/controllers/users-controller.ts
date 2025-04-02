import { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import bcryptjs from "bcryptjs";

export const updateUser = async (request: Request, response: Response) => {
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

    // Check if new username is unique
    if (username && username !== user.username) {
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
  } catch (error: any) {
    response.status(500).json({ error: "Internal Server Error" });
  }
};