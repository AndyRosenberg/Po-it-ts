import jwt from 'jsonwebtoken';

import { Request, Response } from 'express';


export const generateToken =  (userId: string, request: Request, response: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15d"
  });
  
  const sameSiteValue = request.get('Origin') === process.env.TRUSTED_ORIGIN ? 'none' : 'strict';

  response.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // milliseconds
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: true
  });

  return token;
}

export const expireToken = (request: Request, response: Response) => {
  const sameSiteValue = request.get('Origin') === process.env.TRUSTED_ORIGIN ? 'none' : 'strict';

  response.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: true
  });
}