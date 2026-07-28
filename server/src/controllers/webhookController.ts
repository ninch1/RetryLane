import { Request, Response } from "express";
import { sendWebhook } from "../services/sendWebhook";
import ErrorResponse from "../errors/ErrorResponse";

export const webhookController = async (req: Request, res: Response) => {
  const { destinationUrl, type, payload } = req.body;

  if (!destinationUrl || !type || payload === undefined) {
    throw new ErrorResponse(
      "destinationUrl, type, and payload are required",
      400,
    );
  }

  try {
    const result = await sendWebhook(destinationUrl, { type, payload });

    if (!result.success) {
      throw new ErrorResponse("Destination rejected the webhook", 502);
    }

    res.status(200).json({
      success: true,
      message: "Webhook sent successfully",
      destinationStatusCode: result.statusCode,
    });
    return;
  } catch (error) {
    throw new ErrorResponse("Could not reach the destination", 502);
  }
};
