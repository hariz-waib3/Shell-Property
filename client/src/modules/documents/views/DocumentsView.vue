<script setup>
import { computed, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PillTabs from '@/components/common/PillTabs.vue'
import PaywallBanner from '@/components/common/PaywallBanner.vue'
import DocumentCard from '../components/DocumentCard.vue'
import { db } from '@/stores/db'
import { isLocked } from '@/stores/session'
import { openCheckout, toast } from '@/stores/ui'

const activeCategory = ref('All')

const categories = computed(() => {
  const unique = new Set(db.documents.map((doc) => doc.category))
  return ['All', ...unique]
})

const visibleDocuments = computed(() => {
  if (activeCategory.value === 'All') return db.documents
  return db.documents.filter((doc) => doc.category === activeCategory.value)
})

const documentsLocked = computed(() => isLocked('documents'))

function downloadDocument() {
  if (documentsLocked.value) {
    openCheckout()
    return
  }
  toast('Downloading (demo)')
}
</script>

<template>
  <PageHeader title="Documents" subtitle="Suburb profiles, market reports and templates." />
  <PaywallBanner v-if="documentsLocked" message="Document downloads are included in the Pro plan." />
  <PillTabs v-model="activeCategory" :options="categories" />

  <div class="docs">
    <DocumentCard
      v-for="doc in visibleDocuments"
      :key="doc.id"
      :document="doc"
      :locked="documentsLocked"
      @download="downloadDocument"
    />
  </div>
</template>
