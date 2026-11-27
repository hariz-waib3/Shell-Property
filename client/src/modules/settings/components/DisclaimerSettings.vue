<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { db, updateDisclaimer } from '@/stores/db'
import { toast } from '@/stores/ui'

// Admin only. The disclaimer text at the bottom of every property page.
// Stored in demo-server/data/disclaimer.json. Leaving it empty hides the Disclaimer section.
const text = ref(db.disclaimer)

function save() {
  updateDisclaimer(text.value.trim())
  toast('Disclaimer saved')
}
</script>

<template>
  <form novalidate @submit.prevent="save">
    <h2 class="title">Disclaimer</h2>
    <p class="muted text-sm intro">Shown at the bottom of every property page, for partners and admin.</p>

    <div class="field">
      <label for="disclaimer-text">Disclaimer text</label>
      <textarea id="disclaimer-text" v-model="text" rows="10"></textarea>
      <div class="field-hint">Leave empty to hide the disclaimer. New lines are kept.</div>
    </div>

    <div class="form-actions">
      <BaseButton type="submit" variant="dark">Save changes</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.title {
  font-size: 18px;
}

.intro {
  margin: 4px 0 18px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
</style>
