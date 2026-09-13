import { Badge } from '../ui/Badge';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import type { ApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={STATUS_COLORS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
