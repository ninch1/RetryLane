import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import { z } from 'zod';
import ErrorResponse from '../errors/ErrorResponse';

const createDestinationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required'),
  url: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .refine((value) => {
      try {
        const parsedUrl = new URL(value);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }, 'URL must be a valid URL'),
});

export const createDestination = async (req: Request, res: Response) => {
  const { name, url } = createDestinationSchema.parse(req.body);
  const destination = await prisma.destination.create({
    data: { name, url },
  });
  res.status(201).json({
    success: true,
    data: destination,
    message: 'Destination created successfully',
  });
};

export const getDestinations = async (req: Request, res: Response) => {
  const destinations = await prisma.destination.findMany();
  res.status(200).json({
    success: true,
    data: destinations,
    message: 'Destinations fetched successfully',
  });
};

const deleteDestinationParamsSchema = z.object({
  id: z.uuid('Invalid destination id'),
});

export const deleteDestination = async (req: Request, res: Response) => {
  const { id } = deleteDestinationParamsSchema.parse(req.params);

  const existingDestination = await prisma.destination.findUnique({
    where: { id },
  });

  if (!existingDestination) {
    throw new ErrorResponse('Destination not found', 404);
  }

  const deletedDestination = await prisma.destination.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    data: deletedDestination,
    message: 'Destination deleted successfully',
  });
};
