export function formatPrice(value) {
  if (value == null || value === '') return '–'
  return '$' + Math.round(value).toLocaleString('en-AU')
}

export const packagePrice = (property) => property.buildPrice + property.landPrice

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const propertyCode = (id) => 'SP-' + String(id).padStart(6, '0')

const HUES = [
  [35, 40],
  [200, 30],
  [150, 25],
  [20, 35],
  [260, 20],
  [0, 25],
  [180, 30],
]

// Gradient stand-in until real property photos are uploaded.
export function placeholderImage(id, offset = 0) {
  const [hue, sat] = HUES[(id + offset) % HUES.length]
  return `linear-gradient(135deg,hsl(${hue},${sat}%,62%),hsl(${hue + 20},${sat}%,38%))`
}

// '2026-11-22' -> '22 Nov 2026'
export function formatDate(isoDate) {
  if (!isoDate) return '–'
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Colour class for a property status (used by status tags and status pills).
export function statusColorClass(status) {
  if (status === 'Available' || status === 'Active') return 't-ok'
  if (status === 'Trial') return 't-info'
  if (status === 'Past due') return 't-bad'
  if (status === 'Under Offer') return 't-warn'
  if (status === 'Sold') return 't-bad'
  return 't-grey'
}
