// Google Maps embed URL for a property's exact coordinates.
// Works without an API key; swap for the Maps Embed API (with a key) in production.
export function mapEmbedUrl({ latitude, longitude }) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}&z=16&output=embed`
}

// A number between -limit and limit (90 for latitude, 180 for longitude).
export function isCoordinate(value, limit) {
  if (value === null || value === undefined || value === '') return false
  const number = Number(value)
  return !Number.isNaN(number) && Math.abs(number) <= limit
}
