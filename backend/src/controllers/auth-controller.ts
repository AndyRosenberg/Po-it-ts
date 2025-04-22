import { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { expireToken, generateToken } from '../utils/generate-token.js';
import { sendPasswordResetEmail } from '../utils/email-service.js';
import { isValidEmail } from '../utils/validation.js';

export const getMe = async(request: Request, response: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });

    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    response.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic
    });
  } catch (error: any) {
    console.log("Error in getMe action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}

export const signup = async(request: Request, response: Response) => {
  try {
    const { email, username, password, confirmPassword } = request.body;

    if ([email, username, password, confirmPassword].some(param => !param)) {
      return response.status(400).json({ error: "Please fill out all fields" });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({ error: "Passwords don't match" });
    }

    // Validate that username doesn't look like an email
    if (isValidEmail(username)) {
      return response.status(400).json({ error: "Username cannot be in email format" });
    }

    const user = await prisma.user.findUnique({ where: { username }});
    if (user) {
      return response.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        profilePic: '',
      }
    })

    if (newUser) {
      generateToken(newUser.id, request, response);

      response.status(201).json({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        profilePice: newUser.profilePic
      });
    } else {
      response.status(400).json({ error: "Invalid data" });
    }

  } catch (error: any) {
    console.log("Error in signup action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}

export const login = async(request: Request, response: Response) => {
  const invalidCredentials = () => response.status(404).json({ error: "Invalid Credentials" });
  try {
    const { usernameOrEmail, password } = request.body;

    // Check if input is an email
    const isEmail = isValidEmail(usernameOrEmail);

    // Search by username or email based on input format
    const user = isEmail
      ? await prisma.user.findUnique({ where: { email: usernameOrEmail } })
      : await prisma.user.findUnique({ where: { username: usernameOrEmail } });

    if (!user) {
      return invalidCredentials();
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return invalidCredentials();
    }

    generateToken(user.id, request, response);

    response.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic
    });
  } catch (error: any) {
    console.log("Error in login action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}
export const logout = async(request: Request, response: Response) => {
  try {
    expireToken(request, response);
    response.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in logout action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}

export const forgotPassword = async(request: Request, response: Response) => {
  try {
    const { email } = request.body;

    if (!email) {
      return response.status(400).json({ error: "Please provide an email address" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security reasons, we don't want to reveal if an email exists in our DB
      return response.status(200).json({ message: "If a user with that email exists, a password reset link has been sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token expiration (1 hour from now)
    const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiration
      }
    });

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.username);

    if (!emailSent) {
      console.error(`Failed to send password reset email to ${email}`);
      // We still return success to the client for security reasons
    }

    response.status(200).json({
      message: "If a user with that email exists, a password reset link has been sent"
    });

  } catch (error: any) {
    console.log("Error in forgotPassword action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}

export const resetPassword = async(request: Request, response: Response) => {
  try {
    const { token, password, confirmPassword } = request.body;

    if (!token || !password || !confirmPassword) {
      return response.status(400).json({ error: "Please provide all required fields" });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({ error: "Passwords don't match" });
    }

    // Find user with the provided token and where token hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return response.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    response.status(200).json({ message: "Password has been reset successfully" });

  } catch (error: any) {
    console.log("Error in resetPassword action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}