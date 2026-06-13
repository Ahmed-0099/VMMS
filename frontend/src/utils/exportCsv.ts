type CsvCell = number | string | null | undefined

function escapeCsvCell(value: CsvCell) {
  const stringValue = String(value ?? '')

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

export function exportCsv(filename: string, rows: Array<Record<string, CsvCell>>) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
