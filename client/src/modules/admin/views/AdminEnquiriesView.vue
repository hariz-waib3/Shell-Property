<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import MultiSelect from '@/components/common/MultiSelect.vue'
import SearchDropdown from '@/components/common/SearchDropdown.vue'
import { DEAL_STAGES } from '@/data/constants'
import { db, setEnquiryStage } from '@/stores/db'
import { toast } from '@/stores/ui'
import { formatDate } from '@/utils/format'

const query = ref('')
const stages = ref([])

// Newest first, then narrowed by the search text and the chosen stages.
const visibleEnquiries = computed(() => {
  const text = query.value.trim().toLowerCase()
  return [...db.enquiries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((enquiry) => stages.value.length === 0 || stages.value.includes(enquiry.stage))
    .filter(
      (enquiry) =>
        !text || [enquiry.user, enquiry.ref, enquiry.detail].some((value) => value.toLowerCase().includes(text)),
    )
})

// Colour of the stage pill: new = needs a reply, closed = done, everything else = in progress.
function stageColorClass(stage) {
  if (stage === 'New') return 't-warn'
  if (['Sold', 'Construction', 'Completed'].includes(stage)) return 't-ok'
  return 't-info'
}

function partnerId(name) {
  return db.users.find((user) => user.name === name)?.id
}

function changeStage(id, stage) {
  setEnquiryStage(id, stage)
  toast('Stage updated')
}
</script>

<template>
  <div class="page-top">
    <div class="heading">
      <h1 class="page">Enquiries &amp; deals</h1>
      <p class="sub">Move enquiries through stages. Partners see the same stage in My Deals.</p>
    </div>

    <div class="top-actions">
      <SearchDropdown
        v-model="query"
        :result-count="visibleEnquiries.length"
        placeholder="Search enquiries…"
        hint="Search by partner, reference or detail."
      />
      <MultiSelect v-model="stages" class="stage-filter" :options="DEAL_STAGES" placeholder="All stages" />
    </div>
  </div>

  <div class="card table-wrap">
    <table class="enquiries-table mobile-cards">
      <thead>
        <tr>
          <th class="col-date">Date</th>
          <th>Partner</th>
          <th>Enquiry</th>
          <th class="col-stage">Stage</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="enquiry in visibleEnquiries" :key="enquiry.id">
          <td class="muted nowrap" data-label="Date">{{ formatDate(enquiry.date) }}</td>
          <td class="nowrap" data-label="Partner">
            <RouterLink
              v-if="partnerId(enquiry.user)"
              class="partner-link"
              :to="{ name: 'admin-subscriber-detail', params: { id: partnerId(enquiry.user) } }"
            >
              {{ enquiry.user }}
            </RouterLink>
            <span v-else>{{ enquiry.user }}</span>
          </td>
          <td class="cell-title">
            <div class="enquiry-ref">
              <RouterLink class="enquiry-link" :to="{ name: 'admin-enquiry-detail', params: { id: enquiry.id } }">
                {{ enquiry.ref }}
              </RouterLink>
              <span class="tag t-grey">{{ enquiry.kind }}</span>
            </div>
            <p class="muted enquiry-detail">{{ enquiry.detail }}</p>
          </td>
          <td class="cell-full" data-label="Stage">
            <select
              class="status-pill"
              :class="stageColorClass(enquiry.stage)"
              :value="enquiry.stage"
              aria-label="Stage"
              @change="changeStage(enquiry.id, $event.target.value)"
            >
              <option v-for="stage in DEAL_STAGES" :key="stage">{{ stage }}</option>
            </select>
          </td>
          <td class="cell-actions">
            <BaseButton
              small
              icon-only
              icon="eye"
              label="View enquiry"
              :to="{ name: 'admin-enquiry-detail', params: { id: enquiry.id } }"
            />
          </td>
        </tr>
        <tr v-if="visibleEnquiries.length === 0">
          <td colspan="5" class="muted empty cell-full">No enquiries match these filters.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.stage-filter {
  width: 200px;
}

.col-date {
  width: 120px;
}

.col-actions {
  width: 56px;
}

.enquiry-link {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}

.enquiry-link:hover {
  color: var(--gold-d);
  text-decoration: underline;
}

.col-stage {
  width: 190px;
}

.nowrap {
  white-space: nowrap;
}

.partner-link {
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
}

.partner-link:hover {
  color: var(--gold-d);
}

.enquiry-ref {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.enquiry-detail {
  margin-top: 3px;
  font-size: 13px;
}

.empty {
  padding: 28px;
  text-align: center;
}
</style>
