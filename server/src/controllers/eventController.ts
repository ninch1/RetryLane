import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getDestinationEvents,
  submitDestinationEvent,
} from '../services/eventService';

const destinationIdParamsSchema = z.object({
  destinationId: z.uuid('Invalid destination id'),
});

const submitEventBodySchema = z.object({
  type: z.string().trim().min(1, 'Event type is required'),
  payload: z.unknown(),
});

export const submitEvent = async (req: Request, res: Response) => {
  const { destinationId } = destinationIdParamsSchema.parse(req.params);
  const { type, payload } = submitEventBodySchema.parse(req.body);

  const result = await submitDestinationEvent(destinationId, { type, payload });

  res.status(200).json({
    success: true,
    data: result,
    message: result.success
      ? 'Event delivered successfully'
      : 'Event delivery failed',
  });
};

export const getEvents = async (req: Request, res: Response) => {
  const { destinationId } = destinationIdParamsSchema.parse(req.params);
  const events = await getDestinationEvents(destinationId);

  res.status(200).json({
    success: true,
    data: events,
    message: 'Events fetched successfully',
  });
};
