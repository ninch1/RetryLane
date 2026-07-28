import { getDestinations } from './api/destinationApi';
import { useQuery } from '@tanstack/react-query';
import { DestinationsList } from './components/DestinationsList';

export default function App() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: getDestinations,
  });
  const destinations = data?.data ?? [];
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';

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
          >
            Add destination
          </button>
        </header>

        {error && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {errorMessage}
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
            <DestinationsList destinations={destinations} />
          )}
        </section>
      </div>
    </main>
  );
}
