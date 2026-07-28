import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import { sendWebhook } from './sendWebhook';
import type { EventStatus, Prisma } from '../generated/prisma/client';

type SubmitEventInput = {
  type: string;
  payload: unknown;
};

export type SubmitEventResult = {
  id: string;
  type: string;
  status: EventStatus;
  destinationStatusCode: number | null;
  success: boolean;
};

export const submitDestinationEvent = async (
  destinationId: string,
  input: SubmitEventInput,
): Promise<SubmitEventResult> => {
  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });

  if (!destination) {
    throw new ErrorResponse('Destination not found', 404);
  }

  const event = await prisma.event.create({
    data: {
      type: input.type,
      payload: input.payload as Prisma.InputJsonValue,
      status: 'PENDING',
      destinationId,
    },
  });

  const webhookPayload = {
    id: event.id,
    type: event.type,
    payload: event.payload,
  };

  try {
    const result = await sendWebhook(destination.url, webhookPayload);
    const status: EventStatus = result.success ? 'SUCCESS' : 'FAILED';

    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { status },
    });

    return {
      id: updatedEvent.id,
      type: updatedEvent.type,
      status: updatedEvent.status,
      destinationStatusCode: result.statusCode,
      success: result.success,
    };
  } catch {
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { status: 'FAILED' },
    });

    return {
      id: updatedEvent.id,
      type: updatedEvent.type,
      status: updatedEvent.status,
      destinationStatusCode: null,
      success: false,
    };
  }
};

export const getDestinationEvents = async (destinationId: string) => {
  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });

  if (!destination) {
    throw new ErrorResponse('Destination not found', 404);
  }

  return prisma.event.findMany({
    where: { destinationId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });
};
