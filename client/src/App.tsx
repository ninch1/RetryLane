import {
  createDestination,
  deleteDestination,
  getDestinations,
} from './api/destinationApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { DestinationsList } from './components/DestinationsList';

export default function App() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, error, isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: getDestinations,
  });

  const createDestinationMutation = useMutation({
    mutationFn: createDestination,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setName('');
      setUrl('');
      setIsFormOpen(false);
    },
  });
  const deleteDestinationMutation = useMutation({
    mutationFn: deleteDestination,
    onSuccess: async () => {
      setDeleteError(null);
      await queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
    onError: (mutationError) => {
      if (mutationError instanceof Error) {
        setDeleteError(mutationError.message);
      } else {
        setDeleteError('Failed to delete destination');
      }
    },
  });

  const destinations = data?.data ?? [];
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';
  const createErrorMessage =
    createDestinationMutation.error instanceof Error
      ? createDestinationMutation.error.message
      : null;

  const handleCreateDestination: NonNullable<
    ComponentProps<'form'>['onSubmit']
  > = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setFormError('Name is required');
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setFormError('URL must start with http:// or https://');
        return;
      }
    } catch {
      setFormError('URL must be a valid URL');
      return;
    }

    setFormError(null);
    createDestinationMutation.mutate({ name: trimmedName, url: trimmedUrl });
  };

  const handleDeleteDestination = (destinationId: string) => {
    setDeleteError(null);
    deleteDestinationMutation.mutate(destinationId);
  };

  return (
    <main className='min-h-screen bg-slate-50 px-6 py-12 text-slate-900'>
      <div className='mx-auto max-w-5xl'>
        <header className='mb-8 flex items-center justify-between'>
          <div>
            <p className='mb-1 text-sm font-medium text-blue-600'>RetryLane</p>

            <h1 className='text-3xl font-bold tracking-tight'>Destinations</h1>

            <p className='mt-2 text-sm text-slate-500'>
              Manage the endpoints that receive your webhook events.
            </p>
          </div>

          <button
            type='button'
            className='cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700'
            onClick={() => {
              setFormError(null);
              setIsFormOpen((current) => !current);
            }}
          >
            {isFormOpen ? 'Close form' : 'Add destination'}
          </button>
        </header>

        {isFormOpen && (
          <section className='mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-slate-900'>
              Create destination
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              Add a destination endpoint to receive webhook events.
            </p>

            <form className='mt-5 space-y-4' onSubmit={handleCreateDestination}>
              <div>
                <label
                  htmlFor='destination-name'
                  className='mb-1 block text-sm font-medium text-slate-700'
                >
                  Name
                </label>
                <input
                  id='destination-name'
                  type='text'
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  value={name}
                  onChange={(event) => {
                    setFormError(null);
                    setName(event.target.value);
                  }}
                  placeholder='Billing webhook endpoint'
                  required
                  disabled={createDestinationMutation.isPending}
                />
              </div>

              <div>
                <label
                  htmlFor='destination-url'
                  className='mb-1 block text-sm font-medium text-slate-700'
                >
                  URL
                </label>
                <input
                  id='destination-url'
                  type='url'
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  value={url}
                  onChange={(event) => {
                    setFormError(null);
                    setUrl(event.target.value);
                  }}
                  placeholder='https://example.com/webhooks/retrylane'
                  required
                  disabled={createDestinationMutation.isPending}
                />
              </div>

              {formError && (
                <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {formError}
                </div>
              )}

              {createErrorMessage && !formError && (
                <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {createErrorMessage}
                </div>
              )}

              <div className='flex items-center gap-3'>
                <button
                  type='submit'
                  className='cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400'
                  disabled={createDestinationMutation.isPending}
                >
                  {createDestinationMutation.isPending
                    ? 'Saving...'
                    : 'Save destination'}
                </button>
                <button
                  type='button'
                  className='cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                  onClick={() => {
                    setFormError(null);
                    setIsFormOpen(false);
                  }}
                  disabled={createDestinationMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {error && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {errorMessage}
          </div>
        )}

        {deleteError && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {deleteError}
          </div>
        )}

        <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-200 px-6 py-4'>
            <h2 className='font-semibold'>Saved destinations</h2>
            <p className='mt-1 text-sm text-slate-500'>
              {destinations.length} destination
              {destinations.length === 1 ? '' : 's'}
            </p>
          </div>

          {isLoading && (
            <div className='px-6 py-10 text-center text-sm text-slate-500'>
              Loading destinations...
            </div>
          )}

          {!isLoading && !error && destinations.length === 0 && (
            <div className='px-6 py-12 text-center'>
              <h3 className='font-semibold text-slate-800'>
                No destinations yet
              </h3>

              <p className='mt-2 text-sm text-slate-500'>
                Create your first destination to start delivering webhooks.
              </p>
            </div>
          )}

          {!isLoading && destinations.length > 0 && (
            <DestinationsList
              destinations={destinations}
              deletingDestinationId={deleteDestinationMutation.variables ?? null}
              onDelete={handleDeleteDestination}
            />
          )}
        </section>
      </div>
    </main>
  );
}
