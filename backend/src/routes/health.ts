import { Request, Response } from 'express';
import { dbConnection } from '../database/connection';

export const getHealth = async (req: Request, res: Response) => {
  const dbStatus = dbConnection.getConnectionStatus();

  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus
    }
  });
};