<script setup>
import { computed, ref } from 'vue'
import PillTabs from '@/components/common/PillTabs.vue'
import { filledInsightTables } from '@/data/locationInsights'
import { isCoordinate, mapEmbedUrl } from '@/utils/map'

// "Location" (map, only with coordinates) and "Location insights" (suburb data tables) on the property page.
const props = defineProps({
  property: { type: Object, required: true },
})

// The map is only shown when the admin has entered the exact coordinates for this property.
const hasCoordinates = computed(
  () => isCoordinate(props.property.latitude, 90) && isCoordinate(props.property.longitude, 180),
)
const mapUrl = computed(() => mapEmbedUrl(props.property))

// Location insights are hidden on the property page for now (the data stays in properties.json).
// Set to true to show them again.
const SHOW_LOCATION_INSIGHTS = false

// Only the tables this property has rows for. Hidden completely when there are none.
const tables = computed(() => (SHOW_LOCATION_INSIGHTS ? filledInsightTables(props.property.locationInsights) : []))
const tabLabels = computed(() => tables.value.map((table) => table.label))

const activeLabel = ref('')
const activeTable = computed(() => tables.value.find((table) => table.label === activeLabel.value) || tables.value[0])
const activeRows = computed(() => props.property.locationInsights[activeTable.value.key])
</script>

<template>
  <section v-if="hasCoordinates" class="detail-block">
    <div class="section-t">Location</div>
    <iframe class="map-frame" :src="mapUrl" :title="`Map of ${property.suburb}`" loading="lazy"></iframe>
  </section>

  <section v-if="tables.length" class="detail-block">
    <div class="section-t">Location insights</div>
    <PillTabs :model-value="activeTable.label" :options="tabLabels" @update:model-value="activeLabel = $event" />

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in activeTable.columns" :key="column">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in activeRows" :key="rowIndex">
            <td v-for="(cell, index) in row" :key="index">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="activeTable.key === 'schools'" class="muted note">
      Schools listed may not be in the catchment for this property. Check the map for distance and the state education
      department for catchment zones.
    </p>
  </section>
</template>

<style scoped>
.map-frame {
  display: block;
  width: 100%;
  height: 320px;
  border: 0;
  border-radius: 10px;
  background: var(--bg);
}

.note {
  margin-top: 12px;
  font-size: 12.5px;
}
</style>
