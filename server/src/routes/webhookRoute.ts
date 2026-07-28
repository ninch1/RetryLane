import { Router } from "express";
import { webhookController } from "../controllers/webhookController";

const router = Router();

// This route is used to receive webhooks from the source URL
router.post("/", webhookController);

export default router;
