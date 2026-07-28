import { getDestinations } from './api/destinationApi';
import { useEffect, useState } from 'react';
import type { Destination } from './types/Destination';

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setError(null);

        const response = await getDestinations();
        setDestinations(response.data);
      } catch (error) {
        console.error('Error fetching destinations:', error);

        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error('An unknown error occurred'));
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDestinations();
  }, []);

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
            {error.message}
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
            <ul className='divide-y divide-slate-200'>
              {destinations.map((destination) => (
                <li
                  key={destination.id}
                  className='flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-slate-50'
                >
                  <div className='min-w-0'>
                    <h3 className='font-semibold text-slate-900'>
                      {destination.name}
                    </h3>

                    <p className='mt-1 truncate text-sm text-slate-500'>
                      {destination.url}
                    </p>
                  </div>

                  <span className='shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
                    Active
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
