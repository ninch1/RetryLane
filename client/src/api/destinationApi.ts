import type { Destination } from '../types/Destination';

type DestinationsResponse = {
  data: Destination[];
  success: boolean;
  message: string;
};

type DestinationResponse = {
  data: Destination;
  success: boolean;
  message: string;
};

type CreateDestinationInput = {
  name: string;
  url: string;
};

const getErrorMessage = async (response: Response) => {
  try {
    const errorPayload = (await response.json()) as { message?: string };
    return errorPayload.message ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
};

export const getDestinations = async (): Promise<DestinationsResponse> => {
  const response = await fetch('http://localhost:3000/api/destinations');

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const createDestination = async (
  input: CreateDestinationInput,
): Promise<DestinationResponse> => {
  const response = await fetch('http://localhost:3000/api/destinations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const deleteDestination = async (id: string): Promise<DestinationResponse> => {
  const response = await fetch(`http://localhost:3000/api/destinations/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};
