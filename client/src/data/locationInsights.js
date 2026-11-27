// The "Location insights" tables on the property page: one tab per table, with fixed columns.
// The rows are stored on each property (property.locationInsights.<key>) in properties.json.
// Later the backend may fill them from a property data provider instead.
export const INSIGHT_TABLES = [
  { key: 'schools', label: 'Schools', columns: ['Name', 'Type', 'Sector', 'State', 'Suburb'] },
  { key: 'vacancyRates', label: 'Vacancy rates', columns: ['Area', 'Houses', 'Units', 'All'] },
  { key: 'askingPrices', label: 'Asking prices', columns: ['Property', 'Median asking price', '12 month change'] },
  { key: 'weeklyRents', label: 'Weekly rents', columns: ['Property', 'Median weekly rent', '12 month change'] },
  { key: 'grossYields', label: 'Gross yields', columns: ['Property', 'Gross yield', '12 month change'] },
]

// Only the tables that have rows.
export function filledInsightTables(insights) {
  return INSIGHT_TABLES.filter((table) => insights?.[table.key]?.length > 0)
}
