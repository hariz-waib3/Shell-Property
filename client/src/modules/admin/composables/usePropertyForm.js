import { reactive } from 'vue'
import { addProperty, findProperty, updateProperty } from '@/stores/db'
import { toast } from '@/stores/ui'
import { isCoordinate } from '@/utils/map'

const NEW_PROPERTY = {
  state: 'VIC',
  suburb: '',
  region: '',
  lot: '',
  address: '',
  latitude: '',
  longitude: '',
  estate: '',
  type: 'House',
  status: 'Available',
  active: true,
  storeys: 'Single',
  beds: 4,
  baths: 2,
  cars: 2,
  build: '',
  land: '',
  landWidth: '',
  buildPrice: '',
  landPrice: '',
  contract: '2-part Contract',
  pricing: 'Fixed Price',
  incentive: '',
  titled: false,
  grossYield: '',
  weeklyRent: '',
  registration: '',
  descriptionTitle: '',
  description: '',
  referralFee: '',
  referralTerms: '',
  tags: [],
  inclusions: [],
  purchasingTerms: [],
  images: [],
  floorplans: [],
}

// "4" -> 4. Older listings may hold text such as "4 + Study"; that is kept as it is.
function toNumber(value) {
  const number = Number(value)
  return value !== '' && !Number.isNaN(number) ? number : value
}

// Map coordinates are optional, but must come as a pair.
function toCoordinate(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

// Marked with * in the form. Numbers must be above 0, so partners never see a $0 price or 0 m².
const REQUIRED_FIELDS = [
  { key: 'suburb', label: 'Suburb' },
  { key: 'lot', label: 'Lot' },
  { key: 'build', label: 'Total floor area', number: true },
  { key: 'land', label: 'Land size', number: true },
  { key: 'buildPrice', label: 'Build price', number: true },
  { key: 'landPrice', label: 'Land price', number: true },
]

// Form state for adding or editing a property.
// Used by the add / edit property page.
export function usePropertyForm() {
  const form = reactive({ ...NEW_PROPERTY, tags: [], inclusions: [], purchasingTerms: [], images: [], floorplans: [] })

  // Fill the form from a property, or with blank values when propertyId is null.
  // The form is a copy, so nothing changes on screen until save() is called.
  function load(propertyId) {
    const source = propertyId ? findProperty(propertyId) : NEW_PROPERTY
    Object.assign(form, {
      ...NEW_PROPERTY,
      ...source,
      tags: [...source.tags],
      inclusions: [...(source.inclusions || [])],
      purchasingTerms: [...(source.purchasingTerms || [])],
      images: [...(source.images || [])],
      floorplans: [...(source.floorplans || [])],
    })
  }

  // Saves the form and returns the property id.
  // Returns null (and shows a message) when required fields are missing.
  function save(propertyId) {
    const missing = REQUIRED_FIELDS.filter(({ key, number }) =>
      number ? !(Number(form[key]) > 0) : !String(form[key]).trim(),
    ).map(({ label }) => label)
    if (missing.length > 0) {
      toast(`Please fill in: ${missing.join(', ')}`)
      return null
    }
    if (!coordinatesAreValid()) {
      toast('Check the map coordinates: latitude -90 to 90, longitude -180 to 180, or leave both empty')
      return null
    }

    const data = {
      state: form.state,
      suburb: form.suburb.trim(),
      region: form.region.trim(),
      lot: form.lot.trim(),
      address: form.address.trim(),
      latitude: toCoordinate(form.latitude),
      longitude: toCoordinate(form.longitude),
      estate: form.estate,
      type: form.type,
      status: form.status,
      active: form.active,
      storeys: form.storeys,
      beds: toNumber(form.beds),
      baths: toNumber(form.baths),
      cars: toNumber(form.cars),
      build: Number(form.build) || 0,
      land: Number(form.land) || 0,
      landWidth: Number(form.landWidth) || 0,
      buildPrice: Number(form.buildPrice) || 0,
      landPrice: Number(form.landPrice) || 0,
      contract: form.contract,
      pricing: form.pricing,
      incentive: form.incentive,
      titled: form.titled,
      grossYield: form.grossYield.trim(),
      weeklyRent: form.weeklyRent.trim(),
      registration: form.registration.trim(),
      descriptionTitle: form.descriptionTitle.trim(),
      description: form.description.trim(),
      referralFee: form.referralFee.trim(),
      referralTerms: form.referralTerms.trim(),
      tags: form.tags,
      inclusions: form.inclusions,
      purchasingTerms: form.purchasingTerms,
      images: form.images,
      floorplans: form.floorplans,
    }

    if (propertyId) {
      updateProperty(propertyId, data)
      toast('Property updated')
      return propertyId
    }

    const newId = addProperty(data)
    toast('Property added and visible to partners')
    return newId
  }

  // Both empty, or both valid numbers in range.
  function coordinatesAreValid() {
    const hasLatitude = toCoordinate(form.latitude) !== null
    const hasLongitude = toCoordinate(form.longitude) !== null
    if (!hasLatitude && !hasLongitude) return true
    return isCoordinate(form.latitude, 90) && isCoordinate(form.longitude, 180)
  }

  return { form, load, save }
}
