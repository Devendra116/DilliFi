import express from "express";
import router from "./routes";
import { dbConnection } from "./database/connection";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const startServer = async () => {
  try {
    await dbConnection.connect();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Health check available at: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await dbConnection.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await dbConnection.disconnect();
  process.exit(0);
});

startServer();

export default app;
