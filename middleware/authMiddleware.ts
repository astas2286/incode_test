import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { promisify } from "util";

interface UserIdRequest extends Request {
  userId?: string;
}

export const protect = (req: UserIdRequest, res: Response, next: NextFunction) => {
  try {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token not found' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '');

    // Attach the decoded userId to the request object
    req.userId = (decodedToken as { userId: string }).userId;

    return next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Authorization failed' });
  }
};

