import { Router } from "express";
import { getHealth } from "./health";
import { createStrategy, getStrategies } from "./createStrategy";
import { buyStrategy } from "./buyStrategy";
import { getUserPurchases } from "./userPurchases";
import { executeStrategy } from "./executeStrategy";
import { validateBuyStrategyBody } from "../middleware/x402Config";

const router = Router();
router.get("/health", getHealth);
router.get("/strategies", getStrategies);
router.post("/strategies", createStrategy);
router.post("/strategies/buy",
  validateBuyStrategyBody,           // Validates request body
  buyStrategy                       // Direct X402 implementation
);
router.post("/strategies/execute", executeStrategy);
router.get("/users/:userAddress/purchases", getUserPurchases);

export default router;