import { getDestinationEvents, sendDestinationEvent } from '../api/eventApi';
import { getIngestionUrl } from '../api/config';
import type { Destination } from '../types/Destination';
import type { SendEventResult } from '../types/Event';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const EVENT_TEMPLATES = {
  'order.created': {
    orderId: '123',
    total: 50,
    currency: 'USD',
  },
  'payment.succeeded': {
    paymentId: 'pay_123',
    amount: 50,
    currency: 'USD',
  },
  'user.created': {
    userId: 'user_123',
    email: 'user@example.com',
  },
} as const;

type DestinationCardProps = {
  destination: Destination;
  deletingDestinationId: string | null;
  onDelete: (destinationId: string) => void;
};

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'SUCCESS'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'FAILED'
        ? 'bg-red-50 text-red-700'
        : 'bg-amber-50 text-amber-700';

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

export function DestinationCard({
  destination,
  deletingDestinationId,
  onDelete,
}: DestinationCardProps) {
  const queryClient = useQueryClient();
  const ingestionUrl = getIngestionUrl(destination.id);
  const [isTestFormOpen, setIsTestFormOpen] = useState(false);
  const [eventType, setEventType] = useState('order.created');
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(EVENT_TEMPLATES['order.created'], null, 2),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<SendEventResult | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const eventsQuery = useQuery({
    queryKey: ['destinations', destination.id, 'events'],
    queryFn: () => getDestinationEvents(destination.id),
  });

  const sendEventMutation = useMutation({
    mutationFn: (input: { type: string; payload: unknown }) =>
      sendDestinationEvent(destination.id, input),
    onSuccess: async (response) => {
      setDeliveryResult(response.data);
      setFormError(null);
      await queryClient.invalidateQueries({
        queryKey: ['destinations', destination.id, 'events'],
      });
    },
    onError: (error) => {
      setDeliveryResult(null);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Failed to send event');
      }
    },
  });

  const events = eventsQuery.data?.data ?? [];

  const handleCopyIngestionUrl = async () => {
    await navigator.clipboard.writeText(ingestionUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleTemplateChange = (templateKey: keyof typeof EVENT_TEMPLATES) => {
    setEventType(templateKey);
    setPayloadText(JSON.stringify(EVENT_TEMPLATES[templateKey], null, 2));
    setFormError(null);
    setDeliveryResult(null);
  };

  const handleSendEvent = () => {
    let parsedPayload: unknown;

    try {
      parsedPayload = JSON.parse(payloadText);
    } catch {
      setFormError('Payload must be valid JSON');
      setDeliveryResult(null);
      return;
    }

    const trimmedType = eventType.trim();
    if (!trimmedType) {
      setFormError('Event type is required');
      setDeliveryResult(null);
      return;
    }

    setFormError(null);
    setDeliveryResult(null);
    sendEventMutation.mutate({ type: trimmedType, payload: parsedPayload });
  };

  return (
    <li className='space-y-5 px-6 py-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          <h3 className='font-semibold text-slate-900'>{destination.name}</h3>
          <p className='mt-1 text-sm text-slate-500'>
            <span className='font-medium text-slate-600'>Destination URL:</span>{' '}
            <span className='break-all'>{destination.url}</span>
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-3'>
          <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
            Active
          </span>
          <button
            type='button'
            className='cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'
            onClick={() => onDelete(destination.id)}
            disabled={deletingDestinationId === destination.id}
          >
            {deletingDestinationId === destination.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Event ingestion URL
            </p>
            <p className='mt-1 text-sm text-slate-600'>
              Send a <span className='font-semibold'>POST</span> request to this
              URL. RetryLane stores the event and forwards it to the destination
              URL above.
            </p>
            <p className='mt-2 break-all font-mono text-sm text-slate-800'>
              {ingestionUrl}
            </p>
          </div>

          <button
            type='button'
            className='cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100'
            onClick={handleCopyIngestionUrl}
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
        </div>
      </div>

      <div className='rounded-lg border border-slate-200 p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h4 className='text-sm font-semibold text-slate-900'>Test event</h4>
            <p className='mt-1 text-sm text-slate-500'>
              Send a sample event through RetryLane to verify delivery.
            </p>
          </div>
          <button
            type='button'
            className='cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50'
            onClick={() => setIsTestFormOpen((current) => !current)}
          >
            {isTestFormOpen ? 'Hide form' : 'Send test event'}
          </button>
        </div>

        {isTestFormOpen && (
          <div className='mt-4 space-y-4 border-t border-slate-200 pt-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700'>
                Templates
              </label>
              <div className='flex flex-wrap gap-2'>
                {Object.keys(EVENT_TEMPLATES).map((templateKey) => (
                  <button
                    key={templateKey}
                    type='button'
                    className='cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50'
                    onClick={() =>
                      handleTemplateChange(
                        templateKey as keyof typeof EVENT_TEMPLATES,
                      )
                    }
                  >
                    {templateKey}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor={`event-type-${destination.id}`}
                className='mb-1 block text-sm font-medium text-slate-700'
              >
                Event type
              </label>
              <input
                id={`event-type-${destination.id}`}
                type='text'
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                value={eventType}
                onChange={(event) => {
                  setFormError(null);
                  setDeliveryResult(null);
                  setEventType(event.target.value);
                }}
                disabled={sendEventMutation.isPending}
              />
            </div>

            <div>
              <label
                htmlFor={`event-payload-${destination.id}`}
                className='mb-1 block text-sm font-medium text-slate-700'
              >
                Payload (JSON)
              </label>
              <textarea
                id={`event-payload-${destination.id}`}
                rows={8}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                value={payloadText}
                onChange={(event) => {
                  setFormError(null);
                  setDeliveryResult(null);
                  setPayloadText(event.target.value);
                }}
                disabled={sendEventMutation.isPending}
              />
            </div>

            {formError && (
              <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {formError}
              </div>
            )}

            {deliveryResult && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  deliveryResult.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <p className='font-semibold'>
                  {deliveryResult.success
                    ? 'Event delivered successfully'
                    : 'Event delivery failed'}
                </p>
                <p className='mt-1'>
                  Status: {deliveryResult.status}
                  {deliveryResult.destinationStatusCode !== null &&
                    ` · Destination responded with ${deliveryResult.destinationStatusCode}`}
                </p>
              </div>
            )}

            <button
              type='button'
              className='cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400'
              onClick={handleSendEvent}
              disabled={sendEventMutation.isPending}
            >
              {sendEventMutation.isPending ? 'Sending...' : 'Send event'}
            </button>
          </div>
        )}
      </div>

      <div className='rounded-lg border border-slate-200 p-4'>
        <h4 className='text-sm font-semibold text-slate-900'>Recent events</h4>

        {eventsQuery.isLoading && (
          <p className='mt-3 text-sm text-slate-500'>Loading events...</p>
        )}

        {eventsQuery.error && (
          <p className='mt-3 text-sm text-red-600'>
            {eventsQuery.error instanceof Error
              ? eventsQuery.error.message
              : 'Failed to load events'}
          </p>
        )}

        {!eventsQuery.isLoading && !eventsQuery.error && events.length === 0 && (
          <p className='mt-3 text-sm text-slate-500'>
            No events yet. Send a test event to see delivery history.
          </p>
        )}

        {!eventsQuery.isLoading && !eventsQuery.error && events.length > 0 && (
          <ul className='mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200'>
            {events.map((event) => (
              <li
                key={event.id}
                className='flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm'
              >
                <div>
                  <p className='font-medium text-slate-900'>{event.type}</p>
                  <p className='mt-0.5 text-xs text-slate-500'>
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={event.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
