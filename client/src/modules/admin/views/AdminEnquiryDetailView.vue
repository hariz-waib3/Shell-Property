<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { DEAL_STAGES, ENQUIRY_REQUEST_TYPES, PLANS } from '@/data/constants'
import { WIZARD_STEPS } from '@/modules/sourcing/wizardSteps'
import { db, findEnquiry, findProperty, setEnquiryStage } from '@/stores/db'
import { toast } from '@/stores/ui'
import { formatDate, formatPrice, packagePrice } from '@/utils/format'

// One enquiry: what was asked, the property it is about, the partner who sent it, and its stage.
const props = defineProps({
  id: { type: Number, required: true },
})

const enquiry = computed(() => findEnquiry(props.id))

// Newer enquiries store the property id. Older ones only have the reference text ("Suburb, Lot"), so match on that.
const property = computed(() => {
  const { propertyId, ref } = enquiry.value
  if (propertyId) return findProperty(propertyId)
  const reference = ref.toLowerCase()
  return db.properties.find((item) => `${item.suburb}, ${item.lot}`.toLowerCase() === reference)
})

// Enquiries name the partner who sent them.
const partner = computed(() => db.users.find((user) => user.name.toLowerCase() === enquiry.value.user.toLowerCase()))

const initials = computed(() =>
  enquiry.value.user
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

// Older property enquiries keep the request type and message together in `detail` ("Request hold: message").
const request = computed(() => {
  const { requestType, message, detail } = enquiry.value
  if (requestType) return { type: requestType, message: message || '' }

  const type = ENQUIRY_REQUEST_TYPES.find((name) => detail.startsWith(`${name}: `))
  if (!type) return { type: '', message: detail }
  const text = detail.slice(type.length + 2)
  return { type, message: text === '-' ? '' : text }
})

// Sourcing requests: every answered wizard question, with its label.
const sourcingAnswers = computed(() => {
  const answers = enquiry.value.answers
  if (!answers) return []
  return WIZARD_STEPS.flatMap((step) => step.questions)
    .filter((question) => {
      const value = answers[question.key]
      return Array.isArray(value) ? value.length > 0 : Boolean(value)
    })
    .map((question) => {
      const value = answers[question.key]
      return { label: question.label, value: Array.isArray(value) ? value.join(', ') : value }
    })
})

const stageIndex = computed(() => DEAL_STAGES.indexOf(enquiry.value.stage))

function changeStage(stage) {
  setEnquiryStage(props.id, stage)
  toast('Stage updated')
}

function coverStyle(item) {
  const cover = item.images?.[0]
  return cover ? { backgroundImage: `url("${cover.url}")` } : {}
}
</script>

<template>
  <BaseButton small :to="{ name: 'admin-enquiries' }">← Back to enquiries</BaseButton>

  <EmptyState v-if="!enquiry" class="card not-found" title="Enquiry not found" message="It may have been removed." />

  <template v-else>
    <div class="row title-row">
      <div class="grow">
        <h1 class="page">{{ enquiry.ref }}</h1>
        <p class="muted text-sm">{{ enquiry.kind }} enquiry · received {{ formatDate(enquiry.date) }}</p>
      </div>
      <select
        class="status-pill t-info header-stage"
        :value="enquiry.stage"
        aria-label="Stage"
        @change="changeStage($event.target.value)"
      >
        <option v-for="stage in DEAL_STAGES" :key="stage">{{ stage }}</option>
      </select>
    </div>

    <div class="detail enquiry-detail">
      <!-- Left: the enquiry itself and the property it is about. -->
      <div class="card pad main-card">
        <section>
          <div class="section-t">Enquiry</div>
          <dl class="facts">
            <div>
              <dt>Type</dt>
              <dd>{{ enquiry.kind }}</dd>
            </div>
            <div v-if="request.type">
              <dt>Request</dt>
              <dd>{{ request.type }}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{{ formatDate(enquiry.date) }}</dd>
            </div>
          </dl>

          <div class="message-label">Message</div>
          <p class="message">{{ request.message || 'No message added.' }}</p>
        </section>

        <section v-if="sourcingAnswers.length" class="detail-block">
          <div class="section-t">Buyer requirements</div>
          <dl class="facts">
            <div v-for="answer in sourcingAnswers" :key="answer.label">
              <dt>{{ answer.label }}</dt>
              <dd>{{ answer.value }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="enquiry.kind === 'Property'" class="detail-block">
          <div class="section-t">Property</div>
          <RouterLink
            v-if="property"
            class="property-card"
            :to="{ name: 'admin-property-detail', params: { id: property.id } }"
          >
            <span class="thumb" :style="coverStyle(property)"></span>
            <div class="grow">
              <b>{{ property.suburb }}, {{ property.state }}</b>
              <div class="muted text-sm">{{ property.lot }} · {{ property.estate }}</div>
              <div class="text-sm">{{ formatPrice(packagePrice(property)) }} · {{ property.type }}</div>
            </div>
            <StatusTag :status="property.status" />
            <span v-if="!property.active" class="tag t-grey">Disabled</span>
          </RouterLink>
          <p v-else class="muted">This property is no longer listed (it may have been deleted).</p>
        </section>
      </div>

      <!-- Right: who sent it, and how far it has come. -->
      <aside class="card pad side-card">
        <section>
          <div class="section-t">Partner</div>
          <div class="partner-head">
            <span class="avatar">{{ initials }}</span>
            <div>
              <b>{{ enquiry.user }}</b>
              <div v-if="partner" class="muted text-sm">{{ partner.company }}</div>
            </div>
          </div>

          <dl v-if="partner" class="facts">
            <div>
              <dt>Email</dt>
              <dd>
                <a :href="`mailto:${partner.email}?subject=${encodeURIComponent(enquiry.ref)}`">{{ partner.email }}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a v-if="partner.phone" :href="`tel:${partner.phone.replace(/\s/g, '')}`">{{ partner.phone }}</a>
                <template v-else>–</template>
              </dd>
            </div>
            <div>
              <dt>Plan</dt>
              <dd>{{ partner.plan === PLANS.PRO ? db.plan.name : 'Free' }}</dd>
            </div>
          </dl>
          <p v-else class="muted text-sm">This partner's account wasn't found.</p>

          <BaseButton
            v-if="partner"
            block
            :to="{ name: 'admin-subscriber-detail', params: { id: partner.id } }"
            class="partner-link"
          >
            View partner
          </BaseButton>
        </section>

        <section class="side-section">
          <div class="section-t">Stage</div>
          <ol class="stages">
            <li
              v-for="(stage, index) in DEAL_STAGES"
              :key="stage"
              :class="{ done: index < stageIndex, current: index === stageIndex }"
            >
              <span class="dot" aria-hidden="true">{{ index < stageIndex ? '✓' : '' }}</span>
              {{ stage }}
            </li>
          </ol>
          <p class="muted note">Partners see the same stage in My Deals.</p>
        </section>
      </aside>
    </div>
  </template>
</template>

<style scoped>
.not-found {
  margin-top: 16px;
}

.title-row {
  gap: 12px;
  align-items: center;
  margin: 16px 0;
}

/* Same height and shape as the property page header. */
.header-stage {
  height: 40px;
  border-radius: 8px;
  padding: 0 34px 0 16px;
}

.enquiry-detail {
  grid-template-columns: 1fr 340px;
}

.main-card,
.side-card {
  align-self: start;
}

.main-card {
  padding: 24px;
}

/* No divider lines between sections here: the message box and headings already separate them. */
.main-card .detail-block {
  border-top: 0;
  padding-bottom: 0;
}

.side-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.facts {
  margin: 0;
}

.facts div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
}

.facts dt {
  color: var(--muted);
}

.facts dd {
  margin: 0;
  font-weight: 500;
  text-align: right;
}

.facts a {
  color: var(--gold-d);
}

.message-label {
  margin: 16px 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

.message {
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--bg);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.property-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
}

.property-card:hover {
  border-color: var(--gold);
}

.thumb {
  width: 72px;
  height: 56px;
  flex: none;
  border-radius: 8px;
  background-color: var(--bg);
  background-size: cover;
  background-position: center;
}

.partner-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: 50%;
  background: var(--ink);
  color: var(--gold);
  font-weight: 600;
}

.partner-link {
  margin-top: 14px;
}

/* Stage progress: done (✓), current (gold), still to come (grey). */
.stages {
  list-style: none;
  display: grid;
  gap: 2px;
}

.stages li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 13.5px;
  color: var(--muted);
}

.stages .dot {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--line);
  border-radius: 50%;
  font-size: 11px;
}

.stages li.done {
  color: var(--ink);
}

.stages li.done .dot {
  border-color: var(--ok);
  background: var(--ok-l);
  color: var(--ok);
}

.stages li.current {
  color: var(--ink);
  font-weight: 600;
}

.stages li.current .dot {
  border-color: var(--gold);
  background: var(--gold);
}

.note {
  margin-top: 10px;
  font-size: 12px;
}

@media (max-width: 900px) {
  .enquiry-detail {
    grid-template-columns: 1fr;
  }
}
</style>
