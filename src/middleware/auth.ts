import { Request, Response, NextFunction } from 'express';

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.API_KEY;
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== apiKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  next();
}
