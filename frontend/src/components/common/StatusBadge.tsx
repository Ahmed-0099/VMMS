type StatusBadgeTone = 'success' | 'warning' | 'danger' | 'neutral'

type StatusBadgeProps = {
  label: string
  tone: StatusBadgeTone
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`status-badge status-badge-${tone}`}>{label}</span>
}
