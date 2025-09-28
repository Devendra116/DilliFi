import mongoose from "mongoose";

export const databaseConfig = {
  url: process.env.MONGODB_URL,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    auth: {
      username: "dbuser",
      password: "testing123"
    }
  }
};

// X402 Configuration
export const x402Config = {
  network: process.env.X402_NETWORK || "polygon-amoy",
  facilitatorUrl: process.env.X402_FACILITATOR_URL || "https://x402.polygon.technology"
};