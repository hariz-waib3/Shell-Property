<script setup>
import ToastHost from '@/components/common/ToastHost.vue'
import CheckoutModal from '@/modules/billing/components/CheckoutModal.vue'
import PortalModal from '@/modules/billing/components/PortalModal.vue'
import EnquiryModal from '@/modules/properties/components/EnquiryModal.vue'
import { ui } from '@/stores/ui'
</script>

<template>
  <RouterView />

  <!-- Opened from any page through stores/ui.js -->

  <CheckoutModal v-if="ui.showCheckout" />
  <PortalModal v-if="ui.showPortal" />
  <EnquiryModal v-if="ui.enquiryPropertyId" :property-id="ui.enquiryPropertyId" />
  <ToastHost />
</template>
