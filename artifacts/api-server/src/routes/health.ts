import { Router, type Request, type Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router = Router();

router.get("/healthz", async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

export default router;