import DymoLabel from './DymoLabel';
import type { PhotoStatus } from '../../types/database';

const statusConfig: Record<PhotoStatus, { label: string; variant: 'black' | 'blue' | 'red' | 'gray' | 'yellow' }> = {
  new: { label: 'NEW', variant: 'black' },
  printed: { label: 'PRINTED', variant: 'gray' },
  completed: { label: 'COMPLETED', variant: 'red' },
};

interface StatusBadgeProps {
  status: PhotoStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <DymoLabel variant={config.variant} className={className}>
      {config.label}
    </DymoLabel>
  );
}
