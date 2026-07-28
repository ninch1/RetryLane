import type { Destination } from '../types/Destination';
import { DestinationCard } from './DestinationCard';

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
        <DestinationCard
          key={destination.id}
          destination={destination}
          deletingDestinationId={deletingDestinationId}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
