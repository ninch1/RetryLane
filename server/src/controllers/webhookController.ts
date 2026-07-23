import { Request, Response } from "express";
import { sendWebhook } from "../services/sendWebhook";

export const webhookController = async (req: Request, res: Response) => {
  const { destinationUrl, type, payload } = req.body;

  if (!destinationUrl || !type || payload === undefined) {
    res.status(400).json({
      success: false,
      message: "destinationUrl, type, and payload are required",
    });
    return;
  }

  try {
    const result = await sendWebhook(destinationUrl, { type, payload });

    if (!result.success) {
      res.status(502).json({
        success: false,
        message: "Destination rejected the webhook",
        destinationStatusCode: result.statusCode,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Webhook sent successfully",
      destinationStatusCode: result.statusCode,
    });
  } catch (error) {
    console.error("Webhook delivery failed:", error);

    res.status(502).json({
      success: false,
      message: "Could not reach the destination",
    });
  }
};
