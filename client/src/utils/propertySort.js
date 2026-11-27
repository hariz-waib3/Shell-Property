import { packagePrice } from './format'

// Sort settings for the partner property tables (Properties and My Lists). Used with useTableControls().
export const PROPERTY_SORT = {
  sortValues: {
    property: (p) => `${p.suburb} ${p.lot}`.toLowerCase(),
    status: (p) => p.status,
    price: (p) => packagePrice(p),
    type: (p) => p.type,
    build: (p) => p.build,
    buildPrice: (p) => p.buildPrice,
    land: (p) => p.land,
    verified: (p) => p.verified,
  },
  defaultSortKey: 'verified',
  descendingKeys: ['price', 'build', 'buildPrice', 'land', 'verified'],
}
