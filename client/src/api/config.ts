export const API_BASE_URL = 'http://localhost:3000';

export const getIngestionUrl = (destinationId: string) =>
  `${API_BASE_URL}/api/destinations/${destinationId}/events`;
