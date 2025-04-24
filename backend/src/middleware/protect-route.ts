import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma.js';
import './request-with-user.js'

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const protectRoute = async(request: Request, response: Response, next: NextFunction) => {
  const unauthorizedResponse = () => response.status(401).json({ error: "Unauthorized" });

  try {
    const token = request.cookies.jwt;

    if (!token) {
      return unauthorizedResponse();
    }

    try {
      // Verify JWT token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.userId },
        select: { id: true, username: true, email: true, profilePic: true }
      });

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      request.user = user;
      next();
      
    } catch (jwtError) {
      // If JWT verification fails, it's likely expired or invalid
      if (jwtError instanceof jwt.TokenExpiredError) {
        return response.status(401).json({ error: "Token expired" });
      } else {
        return unauthorizedResponse();
      }
    }
  } catch (error: any) {
    console.error("Error in protect route:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
}