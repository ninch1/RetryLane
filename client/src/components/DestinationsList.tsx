import type { Destination } from '../types/Destination';

type DestinationsListProps = {
  destinations: Destination[];
  deletingDestinationId: string | null;
  onDelete: (destinationId: string) => void;
};

export function DestinationsList({
  destinations,
  deletingDestinationId,
  onDelete,
}: DestinationsListProps) {
  return (
    <ul className='divide-y divide-slate-200'>
      {destinations.map((destination) => (
        <li
          key={destination.id}
          className='flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-slate-50'
        >
          <div className='min-w-0'>
            <h3 className='font-semibold text-slate-900'>{destination.name}</h3>

            <p className='mt-1 truncate text-sm text-slate-500'>{destination.url}</p>
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
        </li>
      ))}
    </ul>
  );
}
