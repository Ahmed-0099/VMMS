type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="summary-card p-4">
      <h1 className="page-title h3 mb-2">{title}</h1>
      <p className="text-secondary mb-4">{description}</p>
      <div className="alert alert-info mb-0">
        This module is part of the scoped Phase 1 build. Create its form, table, API service, and Prisma-backed Express routes when you reach it in the build order.
      </div>
    </section>
  )
}
