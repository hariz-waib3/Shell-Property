<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { resetDemoData } from '@/stores/db'
import { toast } from '@/stores/ui'

// Demo mode only (see stores/demoStorage.js). Remove this section once the API is live.
const confirming = ref(false)

async function reset() {
  await resetDemoData()
  confirming.value = false
  toast('Demo data reset')
}
</script>

<template>
  <h2 class="title">Demo data</h2>
  <p class="muted text-sm intro">
    All data is kept in JSON files on the demo server (<code>demo-server/data/properties.json</code>,
    <code>users.json</code>, ...). Everything you add or change is saved there, so everyone using the demo sees it.
  </p>

  <div class="reset">
    <div class="grow">
      <b>Reset demo data</b>
      <p class="muted text-sm">
        Puts back the original sample properties, subscribers and enquiries. Your changes are removed.
      </p>
    </div>
    <BaseButton danger @click="confirming = true">Reset</BaseButton>
  </div>

  <ConfirmDialog
    v-if="confirming"
    title="Reset demo data?"
    message="All changes, including uploaded photos, will be replaced by the original sample data."
    confirm-label="Reset demo data"
    danger
    @confirm="reset"
    @cancel="confirming = false"
  />
</template>

<style scoped>
.title {
  font-size: 18px;
}

.intro {
  margin: 2px 0 18px;
  line-height: 1.6;
}

.reset {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: 12px;
}
</style>
