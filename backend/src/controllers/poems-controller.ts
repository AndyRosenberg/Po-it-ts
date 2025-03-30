import { Request, Response } from "express";
import prisma from "../db/prisma.js";

export const createPoem = async (request: Request, response: Response) => {
  try {
    const newPoem = await prisma.poem.create({
      data: {
        userId: request.user.id
      }
    });

    response.status(201).json(newPoem);
  } catch (error: any) {
    console.error("Error in sendMessage: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}

export const getPoems = async (request: Request, response: Response) => {
  try {
    const poems = await prisma.poem.findMany({
      where: {
        userId: request.user.id
      }
    });

    if (!poems) {
      return response.status(200).json([]);
    }

    response.status(200).json(poems);
  } catch (error: any) {
    console.error("Error in getMessages: ", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
}