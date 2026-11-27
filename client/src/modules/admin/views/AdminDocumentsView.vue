<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import DocumentFormModal from '../components/DocumentFormModal.vue'
import { db, deleteDocument } from '@/stores/db'
import { toast } from '@/stores/ui'

const route = useRoute()
const router = useRouter()

const showForm = ref(false)

function removeDocument(id) {
  deleteDocument(id)
  toast('Document deleted')
}

// The dashboard links here with ?action=upload to open the form straight away.
onMounted(() => {
  if (route.query.action === 'upload') {
    showForm.value = true
    router.replace({ query: {} })
  }
})
</script>

<template>
  <PageHeader title="Documents" subtitle="Suburb profiles, reports and templates shown to partners.">
    <template #actions>
      <BaseButton variant="dark" icon="upload" @click="showForm = true">Upload document</BaseButton>
    </template>
  </PageHeader>

  <div class="card table-wrap">
    <table class="mobile-cards">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Description</th>
          <th>Size</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in db.documents" :key="doc.id">
          <td class="cell-title">
            <b>{{ doc.title }}</b>
          </td>
          <td data-label="Category">{{ doc.category }}</td>
          <td class="muted cell-full">{{ doc.description }}</td>
          <td class="muted" data-label="Size">{{ doc.size }}</td>
          <td class="cell-actions">
            <BaseButton small danger icon="trash" @click="removeDocument(doc.id)">Delete</BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <DocumentFormModal v-if="showForm" @close="showForm = false" />
</template>
