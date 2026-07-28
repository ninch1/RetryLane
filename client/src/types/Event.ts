export type EventStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface EventSummary {
  id: string;
  type: string;
  status: EventStatus;
  createdAt: string;
}

export interface SendEventInput {
  type: string;
  payload: unknown;
}

export interface SendEventResult {
  id: string;
  type: string;
  status: EventStatus;
  destinationStatusCode: number | null;
  success: boolean;
}
