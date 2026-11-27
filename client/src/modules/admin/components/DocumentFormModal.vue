<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { reactive } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { DOCUMENT_CATEGORIES } from '@/data/constants'
import { addDocument } from '@/stores/db'
import { toast } from '@/stores/ui'

const emit = defineEmits(['close'])

const form = reactive({
  title: '',
  category: DOCUMENT_CATEGORIES[0],
  description: '',
})

function publishDocument() {
  if (!form.title.trim()) {
    toast('Title is required')
    return
  }

  addDocument({
    title: form.title.trim(),
    category: form.category,
    description: form.description,
  })

  toast('Document published')
  emit('close')
}
</script>

<template>
  <BaseModal title="Upload document" @close="emit('close')">
    <div class="field">
      <label for="df-title">Title</label>
      <input id="df-title" v-model="form.title" placeholder="e.g. Clyde North, VIC 3978" />
    </div>

    <div class="field">
      <label for="df-category">Category</label>
      <select id="df-category" v-model="form.category">
        <option v-for="category in DOCUMENT_CATEGORIES" :key="category">{{ category }}</option>
      </select>
    </div>

    <div class="field">
      <label for="df-description">Short description</label>
      <input id="df-description" v-model="form.description" />
    </div>

    <div class="field">
      <label for="df-file">File</label>
      <input id="df-file" type="file" accept=".pdf" />
    </div>

    <template #footer>
      <BaseButton @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="dark" icon="upload" @click="publishDocument">Publish</BaseButton>
    </template>
  </BaseModal>
</template>
