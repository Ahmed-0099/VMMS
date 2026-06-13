import type {
  ComplianceReport,
  FuelReport,
  ReportData,
  ReportFilters,
  ReportType,
  VehicleReport,
  WorkOrderReport,
} from '../types/report'

export type ExportChartImage = {
  dataUrl: string
  height: number
  width: number
}

type PdfColor = [number, number, number]
type ReportSection = {
  headers: string[]
  rows: Array<Array<number | string>>
  title: string
}

type PdfImage = {
  bytes: Uint8Array
  height: number
  width: number
}

const pageWidth = 595.28
const pageHeight = 841.89
const margin = 36
const contentWidth = pageWidth - margin * 2
const green: PdfColor = [0.059, 0.318, 0.196]
const navy: PdfColor = [0.071, 0.188, 0.278]
const muted: PdfColor = [0.404, 0.467, 0.537]
const border: PdfColor = [0.874, 0.906, 0.937]
const softGreen: PdfColor = [0.925, 0.973, 0.949]
const softPanel: PdfColor = [0.984, 0.988, 0.996]

function normalizePdfText(value: number | string) {
  return String(value)
    .replaceAll('\u00a0', ' ')
    .replace(/[^\x20-\x7E]/g, '')
}

function escapePdfText(value: number | string) {
  return normalizePdfText(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

function formatCurrency(value: number) {
  return `PKR ${value.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

function formatNumber(value: number) {
  return value.toLocaleString('en-PK', { maximumFractionDigits: 2 })
}

function formatQuantity(value: number) {
  return `${formatNumber(value)} L`
}

function formatStatus(value: string) {
  return value.replaceAll('_', ' ')
}

function number(value: number) {
  return value.toFixed(2).replace(/\.00$/, '')
}

function color([red, greenValue, blue]: PdfColor, mode: 'fill' | 'stroke') {
  return `${number(red)} ${number(greenValue)} ${number(blue)} ${mode === 'fill' ? 'rg' : 'RG'}`
}

function textWidth(value: number | string, fontSize: number) {
  return normalizePdfText(value).length * fontSize * 0.5
}

function truncateText(value: number | string, maxWidth: number, fontSize: number) {
  const normalizedValue = normalizePdfText(value)

  if (textWidth(normalizedValue, fontSize) <= maxWidth) {
    return normalizedValue
  }

  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * 0.5)) - 3)
  return `${normalizedValue.slice(0, maxChars)}...`
}

function decodeBase64DataUrl(dataUrl: string) {
  const [, base64 = ''] = dataUrl.split(',')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function stringToBytes(value: string) {
  const bytes = new Uint8Array(value.length)

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff
  }

  return bytes
}

function concatBytes(parts: Uint8Array[]) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0)
  const output = new Uint8Array(totalLength)
  let offset = 0

  parts.forEach((part) => {
    output.set(part, offset)
    offset += part.length
  })

  return output
}

function getFilterSummary(filters: ReportFilters, vehicleLabel: string) {
  return [
    ['Vehicle', vehicleLabel || 'All vehicles'],
    ['Status', filters.status ? formatStatus(filters.status) : 'All statuses'],
    ['From', filters.from || 'Not set'],
    ['To', filters.to || 'Not set'],
  ]
}

function getSummaryCards(reportType: ReportType, data: ReportData) {
  if (reportType === 'fuel') {
    const report = data as FuelReport

    return [
      ['Total Quantity', formatQuantity(report.summary.totalQuantity)],
      ['Total Fuel Cost', formatCurrency(report.summary.totalCost)],
      ['Average Unit Cost', formatCurrency(report.summary.averageUnitCost)],
      ['Fuel Entries', formatNumber(report.summary.logCount)],
    ]
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport

    return [
      ['Total Jobs', formatNumber(report.summary.totalWorkOrders)],
      ['Open Work', formatNumber(report.summary.openCount)],
      ['Completed', formatNumber(report.summary.completedCount)],
      ['Work Cost', formatCurrency(report.summary.totalCost)],
    ]
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport

    return [
      ['Total Documents', formatNumber(report.summary.totalDocuments)],
      ['Valid', formatNumber(report.summary.validCount)],
      ['Expiring Soon', formatNumber(report.summary.expiringSoonCount)],
      ['Expired', formatNumber(report.summary.expiredCount)],
    ]
  }

  const report = data as VehicleReport

  return [
    ['Total Vehicles', formatNumber(report.summary.totalVehicles)],
    ['Active', formatNumber(report.summary.active)],
    ['In Maintenance', formatNumber(report.summary.inMaintenance)],
    ['Out of Service', formatNumber(report.summary.outOfService)],
  ]
}

function getReportSections(reportType: ReportType, data: ReportData): ReportSection[] {
  if (reportType === 'fuel') {
    const report = data as FuelReport

    return [
      {
        headers: ['Vehicle', 'Entries', 'Total Quantity', 'Total Cost', 'Average Unit Cost'],
        rows: report.rows.map((row) => [
          row.vehicle,
          row.logCount,
          formatQuantity(row.totalQuantity),
          formatCurrency(row.totalCost),
          formatCurrency(row.averageUnitCost),
        ]),
        title: 'Fuel Cost by Vehicle',
      },
      {
        headers: ['Date', 'Entries', 'Total Quantity', 'Total Cost'],
        rows: report.dateRows.map((row) => [
          row.date,
          row.logCount,
          formatQuantity(row.totalQuantity),
          formatCurrency(row.totalCost),
        ]),
        title: 'Fuel Activity by Date',
      },
    ]
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport

    return [
      {
        headers: ['Status', 'Work Orders', 'Total Cost'],
        rows: report.rows.map((row) => [row.label, row.count, formatCurrency(row.totalCost ?? 0)]),
        title: 'Work Orders by Status',
      },
      {
        headers: ['Vehicle', 'Work Orders', 'Total Cost'],
        rows: report.vehicleRows.map((row) => [row.vehicle, row.count, formatCurrency(row.totalCost)]),
        title: 'Work Orders by Vehicle',
      },
    ]
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport

    return [
      {
        headers: ['Status', 'Documents'],
        rows: report.rows.map((row) => [row.label, row.count]),
        title: 'Compliance by Status',
      },
      {
        headers: ['Vehicle', 'Documents', 'Valid', 'Expiring Soon', 'Expired'],
        rows: report.vehicleRows.map((row) => [row.vehicle, row.count, row.valid, row.expiringSoon, row.expired]),
        title: 'Compliance by Vehicle',
      },
    ]
  }

  const report = data as VehicleReport

  return [
    {
      headers: ['Status', 'Vehicles'],
      rows: report.rows.map((row) => [row.label, row.count]),
      title: 'Vehicles by Status',
    },
    {
      headers: ['Registration', 'Vehicle', 'Status'],
      rows: report.vehicles.map((vehicle) => [vehicle.registrationNumber, vehicle.label, formatStatus(vehicle.status)]),
      title: 'Vehicle Detail',
    },
  ]
}

class PdfReportBuilder {
  private cursorY = pageHeight - margin
  private readonly pages: string[] = ['']

  private get pageIndex() {
    return this.pages.length - 1
  }

  private addOperation(operation: string) {
    this.pages[this.pageIndex] += `${operation}\n`
  }

  private addPage() {
    this.pages.push('')
    this.cursorY = pageHeight - margin
  }

  private ensureSpace(height: number) {
    if (this.cursorY - height < margin) {
      this.addPage()
    }
  }

  private fillRect(x: number, y: number, width: number, height: number, fill: PdfColor) {
    this.addOperation(`${color(fill, 'fill')} ${number(x)} ${number(y)} ${number(width)} ${number(height)} re f`)
  }

  private strokeRect(x: number, y: number, width: number, height: number, stroke: PdfColor) {
    this.addOperation(`${color(stroke, 'stroke')} ${number(x)} ${number(y)} ${number(width)} ${number(height)} re S`)
  }

  private line(x1: number, y1: number, x2: number, y2: number, stroke: PdfColor) {
    this.addOperation(`${color(stroke, 'stroke')} ${number(x1)} ${number(y1)} m ${number(x2)} ${number(y2)} l S`)
  }

  private text(value: number | string, x: number, y: number, size: number, fill: PdfColor, bold = false) {
    const font = bold ? 'F2' : 'F1'
    this.addOperation(`${color(fill, 'fill')} BT /${font} ${number(size)} Tf 1 0 0 1 ${number(x)} ${number(y)} Tm (${escapePdfText(value)}) Tj ET`)
  }

  addHeader(reportTitle: string, generatedAt: string) {
    this.text('VMMS Fleet Report', margin, this.cursorY, 10, green, true)
    this.cursorY -= 24
    this.text(`${reportTitle} Report`, margin, this.cursorY, 26, navy, true)
    this.text('Generated', pageWidth - margin - 92, this.cursorY + 14, 9, muted, true)
    this.text(generatedAt, pageWidth - margin - 92, this.cursorY, 9, muted)
    this.cursorY -= 20
    this.line(margin, this.cursorY, pageWidth - margin, this.cursorY, border)
    this.cursorY -= 22
  }

  addCards(cards: Array<Array<number | string>>, columns = 4) {
    const gap = 8
    const cardWidth = (contentWidth - gap * (columns - 1)) / columns
    const cardHeight = 54
    this.ensureSpace(cardHeight + 14)

    cards.forEach(([label, value], index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const x = margin + column * (cardWidth + gap)
      const top = this.cursorY - row * (cardHeight + gap)
      const y = top - cardHeight

      this.fillRect(x, y, cardWidth, cardHeight, softPanel)
      this.strokeRect(x, y, cardWidth, cardHeight, border)
      this.text(truncateText(label, cardWidth - 18, 8), x + 9, top - 17, 8, muted, true)
      this.text(truncateText(value, cardWidth - 18, 14), x + 9, top - 37, 14, navy, true)
    })

    const rowCount = Math.ceil(cards.length / columns)
    this.cursorY -= rowCount * cardHeight + (rowCount - 1) * gap + 18
  }

  addChart(chartImage: PdfImage | null) {
    this.ensureSpace(260)
    this.text('Visual Summary', margin, this.cursorY, 15, navy, true)
    this.cursorY -= 16

    if (!chartImage) {
      const boxHeight = 150
      this.fillRect(margin, this.cursorY - boxHeight, contentWidth, boxHeight, softPanel)
      this.strokeRect(margin, this.cursorY - boxHeight, contentWidth, boxHeight, border)
      this.text('No chart available for this export.', margin + 145, this.cursorY - 78, 11, muted, true)
      this.cursorY -= boxHeight + 20
      return
    }

    const imageWidth = contentWidth
    const imageHeight = Math.min(245, (chartImage.height / chartImage.width) * imageWidth)
    this.addOperation(`q ${number(imageWidth)} 0 0 ${number(imageHeight)} ${number(margin)} ${number(this.cursorY - imageHeight)} cm /Im1 Do Q`)
    this.cursorY -= imageHeight + 22
  }

  addTable(section: ReportSection) {
    this.ensureSpace(80)
    this.text(section.title, margin, this.cursorY, 15, navy, true)
    this.cursorY -= 16
    this.drawTableHeader(section.headers)

    const rows = section.rows.length > 0 ? section.rows : [Array(section.headers.length).fill('No data found for this section.')]

    rows.forEach((row) => {
      this.ensureSpace(28)

      if (this.cursorY > pageHeight - margin - 10) {
        this.text(section.title, margin, this.cursorY, 15, navy, true)
        this.cursorY -= 16
        this.drawTableHeader(section.headers)
      }

      this.drawTableRow(row, section.headers.length)
    })

    this.cursorY -= 16
  }

  private drawTableHeader(headers: string[]) {
    const rowHeight = 24
    const columnWidth = contentWidth / headers.length
    const y = this.cursorY - rowHeight
    this.fillRect(margin, y, contentWidth, rowHeight, softGreen)
    this.strokeRect(margin, y, contentWidth, rowHeight, border)

    headers.forEach((header, index) => {
      const x = margin + index * columnWidth + 6
      this.text(truncateText(header, columnWidth - 12, 8), x, this.cursorY - 16, 8, navy, true)
    })

    this.cursorY -= rowHeight
  }

  private drawTableRow(row: Array<number | string>, columnCount: number) {
    const rowHeight = 24
    const columnWidth = contentWidth / columnCount
    const y = this.cursorY - rowHeight
    this.strokeRect(margin, y, contentWidth, rowHeight, border)

    row.forEach((cell, index) => {
      const x = margin + index * columnWidth + 6
      this.text(truncateText(cell, columnWidth - 12, 8.5), x, this.cursorY - 16, 8.5, navy, index === 0)
    })

    this.cursorY -= rowHeight
  }

  build(chartImage: PdfImage | null) {
    return createPdf(this.pages, chartImage)
  }
}

function createImageObject(image: PdfImage, objectId: number) {
  return concatBytes([
    stringToBytes(
      `${objectId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
    ),
    image.bytes,
    stringToBytes('\nendstream\nendobj\n'),
  ])
}

function createStreamObject(objectId: number, content: string) {
  const contentBytes = stringToBytes(content)
  return concatBytes([
    stringToBytes(`${objectId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`),
    contentBytes,
    stringToBytes('\nendstream\nendobj\n'),
  ])
}

function createPdf(pageContents: string[], chartImage: PdfImage | null) {
  const imageObjectId = chartImage ? 5 : null
  const firstPageId = chartImage ? 6 : 5
  const objects: Uint8Array[] = []
  const pageIds = pageContents.map((_, index) => firstPageId + index * 2)
  const contentIds = pageIds.map((pageId) => pageId + 1)
  const pagesId = 2
  const fontRegularId = 3
  const fontBoldId = 4

  objects.push(stringToBytes(`1 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj\n`))
  objects.push(
    stringToBytes(
      `${pagesId} 0 obj\n<< /Type /Pages /Kids [${pageIds.map((pageId) => `${pageId} 0 R`).join(' ')}] /Count ${pageIds.length} >>\nendobj\n`,
    ),
  )
  objects.push(stringToBytes(`${fontRegularId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`))
  objects.push(stringToBytes(`${fontBoldId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`))

  if (chartImage && imageObjectId) {
    objects.push(createImageObject(chartImage, imageObjectId))
  }

  pageContents.forEach((content, index) => {
    const pageId = pageIds[index]
    const contentId = contentIds[index]
    const imageResource = imageObjectId ? `/XObject << /Im1 ${imageObjectId} 0 R >>` : ''

    objects.push(
      stringToBytes(
        `${pageId} 0 obj\n<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${number(pageWidth)} ${number(pageHeight)}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> ${imageResource} >> /Contents ${contentId} 0 R >>\nendobj\n`,
      ),
    )
    objects.push(createStreamObject(contentId, content))
  })

  const parts: Uint8Array[] = [stringToBytes('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')]
  const offsets = [0]
  let byteOffset = parts[0].length

  objects.forEach((objectBytes) => {
    offsets.push(byteOffset)
    parts.push(objectBytes)
    byteOffset += objectBytes.length
  })

  const xrefOffset = byteOffset
  const xrefLines = [
    'xref',
    `0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n')

  parts.push(stringToBytes(xrefLines))
  return new Blob([concatBytes(parts)], { type: 'application/pdf' })
}

function getPdfImage(chartImage: ExportChartImage | null): PdfImage | null {
  if (!chartImage || !chartImage.dataUrl.startsWith('data:image/jpeg')) {
    return null
  }

  return {
    bytes: decodeBase64DataUrl(chartImage.dataUrl),
    height: chartImage.height,
    width: chartImage.width,
  }
}

export function exportProfessionalReportPdf({
  chartImage,
  data,
  filters,
  reportTitle,
  reportType,
  vehicleLabel,
}: {
  chartImage: ExportChartImage | null
  data: ReportData
  filters: ReportFilters
  reportTitle: string
  reportType: ReportType
  vehicleLabel: string
}) {
  const generatedAt = new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())
  const pdfChartImage = getPdfImage(chartImage)
  const builder = new PdfReportBuilder()

  builder.addHeader(reportTitle, generatedAt)
  builder.addCards(getFilterSummary(filters, vehicleLabel))
  builder.addCards(getSummaryCards(reportType, data))
  builder.addChart(pdfChartImage)
  getReportSections(reportType, data).forEach((section) => builder.addTable(section))

  const blob = builder.build(pdfChartImage)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vmms-${reportType}-report.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
