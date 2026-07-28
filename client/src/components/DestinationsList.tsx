import type { Destination } from '../types/Destination';

type DestinationsListProps = {
  destinations: Destination[];
};

export function DestinationsList({ destinations }: DestinationsListProps) {
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

          <span className='shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
            Active
          </span>
        </li>
      ))}
    </ul>
  );
}
