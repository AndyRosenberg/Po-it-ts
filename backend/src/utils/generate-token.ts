import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';
import prisma from '../db/prisma.js';

// Generate access token (short-lived)
export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "1h"
  });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = async (userId: string) => {
  // Create a secure random token
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // Store the refresh token in the database
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken }
  });
  
  return refreshToken;
};

// Set both tokens in cookies
export const generateTokens = async (userId: string, request: Request, response: Response) => {
  // Generate access token
  const accessToken = generateAccessToken(userId);
  
  // Generate refresh token
  const refreshToken = await generateRefreshToken(userId);
  
  // Get same site setting based on origin
  const sameSiteValue = request.get('Origin') === process.env.TRUSTED_ORIGIN ? 'none' : 'strict';
  
  // Set access token cookie
  response.cookie("jwt", accessToken, {
    maxAge: 3600000, // 1 hour in milliseconds
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: true
  });
  
  // Set refresh token cookie
  response.cookie("refresh", refreshToken, {
    maxAge: 7 * 24 * 3600000, // 7 days in milliseconds
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: true
  });
  
  return { accessToken, refreshToken };
};

// Expire both tokens
export const expireTokens = async (userId: string, request: Request, response: Response) => {
  const sameSiteValue = request.get('Origin') === process.env.TRUSTED_ORIGIN ? 'none' : 'strict';
  
  // Clear access token cookie
  response.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: true
  });
  
  // Clear refresh token cookie
  response.cookie("refresh", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: true
  });
  
  // Clear refresh token in database
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
  }
};