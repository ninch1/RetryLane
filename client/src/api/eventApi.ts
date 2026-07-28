import { API_BASE_URL } from './config';
import type { EventSummary, SendEventInput, SendEventResult } from '../types/Event';

type EventsResponse = {
  data: EventSummary[];
  success: boolean;
  message: string;
};

type SendEventResponse = {
  data: SendEventResult;
  success: boolean;
  message: string;
};

const getErrorMessage = async (response: Response) => {
  try {
    const errorPayload = (await response.json()) as {
      message?: string;
      errors?: { path: string; message: string }[];
    };

    if (errorPayload.errors?.length) {
      return errorPayload.errors.map((issue) => issue.message).join(', ');
    }

    return errorPayload.message ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
};

export const getDestinationEvents = async (
  destinationId: string,
): Promise<EventsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/destinations/${destinationId}/events`,
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const sendDestinationEvent = async (
  destinationId: string,
  input: SendEventInput,
): Promise<SendEventResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/destinations/${destinationId}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};
