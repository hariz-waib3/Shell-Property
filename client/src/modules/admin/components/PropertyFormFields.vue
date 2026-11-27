<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import TagInput from '@/components/common/TagInput.vue'
import { db } from '@/stores/db'
import { vDecimal } from '@/directives/vDecimal'
import { vNoAutofill } from '@/directives/vNoAutofill'
import { isCoordinate, mapEmbedUrl } from '@/utils/map'
import { STATES, PROPERTY_TYPES, PROPERTY_STATUSES, CONTRACT_TYPES, PRICING_TYPES } from '@/data/constants'

// The property input fields on the add / edit property page, grouped like the sections of the property page.
// Photos and floorplans are managed in the right-hand column.
// `form` is the reactive object from usePropertyForm(); the inputs change its fields directly.
const props = defineProps({
  form: { type: Object, required: true },
})

const values = props.form

const STOREYS = ['Single', 'Double']

// The standard list plus anything typed on other properties, so new entries can be picked again.
const suggestionsFor = (key) => [...new Set([...db[key], ...db.properties.flatMap((property) => property[key] || [])])]
const inclusionSuggestions = computed(() => suggestionsFor('inclusions'))
const purchasingTermSuggestions = computed(() => suggestionsFor('purchasingTerms'))

// Regions already used in the chosen state, so the same council is spelled the same way each time.
const regionSuggestions = computed(() =>
  [
    ...new Set(
      db.properties
        .filter((property) => property.state === values.state && property.region)
        .map((property) => property.region),
    ),
  ].sort(),
)

// Optional sections: closed until "Add" is clicked, but open straight away when the property already has them.
const showDescription = ref(Boolean(values.descriptionTitle || values.description))
const showReferral = ref(Boolean(values.referralFee || values.referralTerms))

const hasValue = (value) => value !== '' && value !== null && value !== undefined
const showMap = ref(hasValue(values.latitude) || hasValue(values.longitude))

// Preview only once both coordinates are valid.
const mapPreviewUrl = computed(() =>
  isCoordinate(values.latitude, 90) && isCoordinate(values.longitude, 180) ? mapEmbedUrl(values) : '',
)

function removeMap() {
  Object.assign(values, { latitude: '', longitude: '' })
  showMap.value = false
}

// "Remove" clears the fields too, so nothing hidden is saved.
function removeDescription() {
  Object.assign(values, { descriptionTitle: '', description: '' })
  showDescription.value = false
}

function removeReferral() {
  Object.assign(values, { referralFee: '', referralTerms: '' })
  showReferral.value = false
}
</script>

<template>
  <!-- v-no-autofill: no browser autofill anywhere in this form (see the directive for why). -->
  <div v-no-autofill>
    <section class="form-section">
      <h3 class="form-section-t">Location</h3>
      <div class="grid3">
        <div class="field">
          <label for="pf-state">State</label>
          <CustomSelect id="pf-state" v-model="values.state" :options="STATES" />
        </div>
        <div class="field">
          <label for="pf-suburb">Suburb <span class="required" aria-hidden="true">*</span></label>
          <input id="pf-suburb" v-model="values.suburb" autocomplete="off" />
        </div>
        <div class="field">
          <label for="pf-lot">Lot <span class="required" aria-hidden="true">*</span></label>
          <input id="pf-lot" v-model="values.lot" autocomplete="off" />
        </div>
      </div>

      <div class="grid3">
        <div class="field">
          <label for="pf-region">Region / council</label>
          <input
            id="pf-region"
            v-model="values.region"
            list="pf-region-list"
            autocomplete="off"
            placeholder="e.g. Casey"
          />
          <datalist id="pf-region-list">
            <option v-for="region in regionSuggestions" :key="region" :value="region" />
          </datalist>
        </div>
        <div class="field">
          <label for="pf-address">Street address (optional)</label>
          <input id="pf-address" v-model="values.address" autocomplete="off" placeholder="e.g. 12 Kinship St, 3978" />
        </div>
        <div class="field">
          <label for="pf-estate">Estate / project / stage</label>
          <input id="pf-estate" v-model="values.estate" autocomplete="off" />
        </div>
      </div>

      <!-- Optional: exact map pin. The property page shows a map only when both coordinates are set. -->
      <div class="sub-head">
        <span class="sub-title">Map location <span class="muted">(optional)</span></span>
        <BaseButton v-if="!showMap" small icon="plus" @click="showMap = true">Add map coordinates</BaseButton>
        <BaseButton v-else small danger @click="removeMap">Remove</BaseButton>
      </div>
      <template v-if="showMap">
        <div class="grid2 coordinates">
          <div class="field">
            <label for="pf-latitude">Latitude</label>
            <input
              id="pf-latitude"
              v-model="values.latitude"
              v-decimal.signed
              autocomplete="off"
              placeholder="e.g. -38.1002"
            />
          </div>
          <div class="field">
            <label for="pf-longitude">Longitude</label>
            <input
              id="pf-longitude"
              v-model="values.longitude"
              v-decimal.signed
              autocomplete="off"
              placeholder="e.g. 145.3311"
            />
          </div>
        </div>
        <p class="field-hint map-hint">
          Tip: in Google Maps, right-click the spot and click the numbers at the top to copy them.
        </p>
        <iframe
          v-if="mapPreviewUrl"
          class="map-preview"
          :src="mapPreviewUrl"
          title="Map preview"
          loading="lazy"
        ></iframe>
      </template>
    </section>

    <section class="form-section">
      <h3 class="form-section-t">Property</h3>
      <div class="grid3">
        <div class="field">
          <label for="pf-type">Construction</label>
          <CustomSelect id="pf-type" v-model="values.type" :options="PROPERTY_TYPES" />
        </div>
        <div class="field">
          <label for="pf-status">Status</label>
          <CustomSelect id="pf-status" v-model="values.status" :options="PROPERTY_STATUSES" />
        </div>
        <div class="field">
          <label for="pf-storeys">Elevation</label>
          <CustomSelect id="pf-storeys" v-model="values.storeys" :options="STOREYS" />
        </div>
      </div>

      <div class="grid3">
        <div class="field">
          <label for="pf-beds">Bedrooms</label>
          <input id="pf-beds" v-model="values.beds" v-decimal autocomplete="off" />
        </div>
        <div class="field">
          <label for="pf-baths">Bathrooms</label>
          <input id="pf-baths" v-model="values.baths" v-decimal autocomplete="off" />
        </div>
        <div class="field">
          <label for="pf-cars">Garages</label>
          <input id="pf-cars" v-model="values.cars" v-decimal autocomplete="off" />
        </div>
      </div>

      <div class="grid3">
        <div class="field">
          <label for="pf-build">Total floor area (m²) <span class="required" aria-hidden="true">*</span></label>
          <input id="pf-build" v-model="values.build" v-decimal autocomplete="off" />
        </div>
        <div class="field">
          <label for="pf-land">Land size (m²) <span class="required" aria-hidden="true">*</span></label>
          <input id="pf-land" v-model="values.land" v-decimal autocomplete="off" />
        </div>
        <div class="field">
          <label for="pf-land-width">Land width (m)</label>
          <input id="pf-land-width" v-model="values.landWidth" v-decimal autocomplete="off" />
        </div>
      </div>
    </section>

    <section class="form-section">
      <h3 class="form-section-t">Pricing</h3>
      <div class="grid2">
        <div class="field">
          <label for="pf-build-price">Build price ($) <span class="required" aria-hidden="true">*</span></label>
          <input id="pf-build-price" v-model="values.buildPrice" v-decimal autocomplete="off" />
        </div>
        <div class="field">
          <label for="pf-land-price">Land price ($) <span class="required" aria-hidden="true">*</span></label>
          <input id="pf-land-price" v-model="values.landPrice" v-decimal autocomplete="off" />
        </div>
      </div>

      <div class="grid3">
        <div class="field">
          <label for="pf-contract">Contract type</label>
          <CustomSelect id="pf-contract" v-model="values.contract" :options="CONTRACT_TYPES" />
        </div>
        <div class="field">
          <label for="pf-pricing">Pricing</label>
          <CustomSelect id="pf-pricing" v-model="values.pricing" :options="PRICING_TYPES" />
        </div>
        <div class="field">
          <label for="pf-incentive">Incentive badge (optional)</label>
          <input id="pf-incentive" v-model="values.incentive" autocomplete="off" />
        </div>
      </div>
    </section>

    <section class="form-section">
      <h3 class="form-section-t">Investment snapshot</h3>
      <p class="muted hint">Leave empty to show "On request".</p>
      <div class="grid3">
        <div class="field">
          <label for="pf-yield">Est. gross yield</label>
          <input id="pf-yield" v-model="values.grossYield" autocomplete="off" placeholder="e.g. 4.8%" />
        </div>
        <div class="field">
          <label for="pf-rent">Est. rent per week</label>
          <input id="pf-rent" v-model="values.weeklyRent" autocomplete="off" placeholder="e.g. $580" />
        </div>
        <div class="field">
          <label for="pf-registration">Expected registration</label>
          <DatePicker id="pf-registration" v-model="values.registration" :disabled="values.titled" />
          <div v-if="values.titled" class="field-hint">Titled land: shown as "Titled".</div>
        </div>
      </div>
    </section>

    <section class="form-section">
      <div class="section-head">
        <h3 class="form-section-t">Description</h3>
        <BaseButton v-if="!showDescription" small icon="plus" @click="showDescription = true"
          >Add description</BaseButton
        >
        <BaseButton v-else small danger @click="removeDescription">Remove</BaseButton>
      </div>
      <template v-if="showDescription">
        <div class="field">
          <label for="pf-description-title">Heading</label>
          <input
            id="pf-description-title"
            v-model="values.descriptionTitle"
            autocomplete="off"
            placeholder="e.g. Five Farms"
          />
        </div>
        <div class="field">
          <label for="pf-description">Description</label>
          <textarea
            id="pf-description"
            v-model="values.description"
            autocomplete="off"
            rows="6"
            placeholder="Describe the property, estate and what's nearby."
          ></textarea>
          <div class="field-hint">Each new line shows as a bullet point on the property page.</div>
        </div>
      </template>
    </section>

    <section class="form-section">
      <div class="section-head">
        <h3 class="form-section-t">Referral details</h3>
        <BaseButton v-if="!showReferral" small icon="plus" @click="showReferral = true"
          >Add referral details</BaseButton
        >
        <BaseButton v-else small danger @click="removeReferral">Remove</BaseButton>
      </div>
      <template v-if="showReferral">
        <div class="field fee-field">
          <label for="pf-referral-fee">Referral fee</label>
          <input
            id="pf-referral-fee"
            v-model="values.referralFee"
            autocomplete="off"
            placeholder="e.g. $15,000 + GST"
          />
        </div>
        <div class="field">
          <label for="pf-referral-terms">Payment terms</label>
          <textarea
            id="pf-referral-terms"
            v-model="values.referralTerms"
            autocomplete="off"
            rows="3"
            placeholder="e.g. 50% paid on unconditional land contract, 50% at base stage."
          ></textarea>
        </div>
      </template>
    </section>

    <section class="form-section">
      <h3 class="form-section-t">Inclusions</h3>
      <div class="field">
        <TagInput
          id="pf-inclusions"
          v-model="values.inclusions"
          :suggestions="inclusionSuggestions"
          placeholder="Type to search, or press Enter to add a new one"
        />
        <div class="field-hint">Pick from the list, or type a new inclusion and press Enter.</div>
      </div>
    </section>

    <section class="form-section">
      <h3 class="form-section-t">Purchasing terms</h3>
      <div class="field">
        <TagInput
          id="pf-purchasing-terms"
          v-model="values.purchasingTerms"
          :suggestions="purchasingTermSuggestions"
          placeholder="Type to search, or press Enter to add a new one"
        />
        <div class="field-hint">Pick from the list, or type a new term and press Enter.</div>
      </div>
    </section>

    <section class="form-section">
      <h3 class="form-section-t">Badges</h3>
      <div class="row">
        <label class="chk"><input v-model="values.tags" type="checkbox" value="Exclusive" /> Exclusive</label>
        <label class="chk"><input v-model="values.tags" type="checkbox" value="New" /> New</label>
        <label class="chk"><input v-model="values.titled" type="checkbox" /> Titled</label>
      </div>
    </section>
  </div>
</template>

<style scoped>
.form-section {
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--line);
}

.form-section:last-child {
  border-bottom: 0;
  margin-bottom: 0;
}

.form-section-t {
  margin-bottom: 12px;
  font-size: 15px;
}

/* Map location: a smaller heading row inside the Location section. */
.sub-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}

.sub-title {
  font-size: 13.5px;
  font-weight: 600;
}

.coordinates {
  margin-top: 12px;
}

.map-hint {
  margin: -4px 0 12px;
}

.map-preview {
  display: block;
  width: 100%;
  height: 220px;
  border: 0;
  border-radius: 10px;
  background: var(--bg);
}

.required {
  color: var(--bad);
}

/* Heading on the left, Add / Remove on the right. */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head .form-section-t {
  margin-bottom: 0;
}

/* Space between the heading row and the fields once they are shown. */
.section-head + .field {
  margin-top: 12px;
}

.fee-field {
  max-width: 50%;
}

.hint {
  margin: -6px 0 10px;
  font-size: 12.5px;
}

.row {
  gap: 18px;
}

@media (max-width: 600px) {
  .fee-field {
    max-width: none;
  }
}
</style>
