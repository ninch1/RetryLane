import type { Destination } from '../types/Destination';

type DestinationResponse = {
  data: Destination[];
  success: boolean;
  message: string;
};

export const getDestinations = async (): Promise<DestinationResponse> => {
  const response = await fetch('http://localhost:3000/api/destinations');

  if (!response.ok) {
    throw new Error('Failed to fetch destinations');
  }

  return response.json();
};
