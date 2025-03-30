import { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import bcryptjs from "bcryptjs";
import { expireToken, generateToken } from '../utils/generate-token.js';

export const getMe = async (request: Request, response: Response) => {
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

export const signup = async (request: Request, response: Response) => {
  try {
    const { email, username, password, confirmPassword } = request.body;

    if ([email, username, password, confirmPassword].some(param => !param)) {
      return response.status(400).json({ error: "Please fill out all fields" });
    }

    if (password !== confirmPassword) {
      return response.status(400).json({ error: "Passwords don't match" }); 
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

export const login = async (request: Request, response: Response) => {
  const invalidCredentials = () => response.status(404).json({ error: "Invalid Credentials" });
  try {
    const { username, password } = request.body;

    const user = await prisma.user.findUnique({ where: { username } });

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
export const logout = async (request: Request, response: Response) => {
  try {
    expireToken(request, response);
    response.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.log("Error in login action", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}