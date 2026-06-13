const summaryCards = [
  { label: 'Total Vehicles', value: 0 },
  { label: 'Active Vehicles', value: 0 },
  { label: 'In Maintenance', value: 0 },
  { label: 'Total Drivers', value: 0 },
  { label: 'Open Work Orders', value: 0 },
  { label: 'Completed Orders', value: 0 },
  { label: 'Fuel Cost This Month', value: 'PKR 0' },
  { label: 'Expiring Documents', value: 0 },
]

export function Dashboard() {
  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="page-title h3 mb-1">Dashboard</h1>
          <p className="text-secondary mb-0">VMMS summary for vehicles, drivers, work orders, fuel, and documents.</p>
        </div>
        <span className="badge text-bg-success">Setup Ready</span>
      </div>

      <div className="row g-3">
        {summaryCards.map((card) => (
          <div className="col-12 col-sm-6 col-xl-3" key={card.label}>
            <section className="summary-card p-3 h-100">
              <div className="text-secondary small">{card.label}</div>
              <div className="summary-value mt-2">{card.value}</div>
            </section>
          </div>
        ))}
      </div>

      <section className="summary-card p-4 mt-4">
        <h2 className="h5 mb-3">Build Order</h2>
        <ol className="mb-0">
          <li>Authentication and protected routes</li>
          <li>Vehicle CRUD</li>
          <li>Driver CRUD and assignments</li>
          <li>Work orders, fuel logs, documents, and reports</li>
        </ol>
      </section>
    </>
  )
}
