export type SummaryCardTone = 'neutral' | 'success' | 'warning' | 'danger'

type SummaryCardProps = {
  label: string
  value: string | number
  tone: SummaryCardTone
  helperText: string
  isLoading?: boolean
}

export function SummaryCard({ label, value, tone, helperText, isLoading = false }: SummaryCardProps) {
  return (
    <section className={`summary-card summary-card-${tone}`}>
      <div className="summary-card-topline">
        <span className="summary-card-label">{label}</span>
        <span className="summary-card-dot" aria-hidden="true" />
      </div>

      {isLoading ? <div className="summary-skeleton" aria-label={`${label} loading`} /> : <div className="summary-value">{value}</div>}

      <p className="summary-helper">{helperText}</p>
    </section>
  )
}
