<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DemoDataSettings from '../components/DemoDataSettings.vue'
import PasswordSettings from '../components/PasswordSettings.vue'
import ProfileSettings from '../components/ProfileSettings.vue'
import SubscriptionSettings from '../components/SubscriptionSettings.vue'
import { isAdmin } from '@/stores/session'

// Settings for both roles. Partners also get "Subscription"; the admin has no plan of their own.
// The open section is kept in the URL (?tab=password), so it can be linked to directly.
const route = useRoute()
const router = useRouter()

const sections = computed(() =>
  [
    { key: 'profile', label: 'Profile', hint: 'Name and contact details' },
    { key: 'subscription', label: 'Subscription', hint: 'Plan and billing', partnerOnly: true },
    { key: 'password', label: 'Password', hint: 'Change your password' },
    { key: 'demo', label: 'Demo data', hint: 'Reset the sample data' },
  ].filter((section) => !section.partnerOnly || !isAdmin.value),
)

const activeKey = computed(() => {
  const fromUrl = sections.value.find((section) => section.key === route.query.tab)
  return fromUrl ? fromUrl.key : 'profile'
})

function openSection(key) {
  router.replace({ query: key === 'profile' ? {} : { tab: key } })
}
</script>

<template>
  <div class="page-top">
    <div class="heading">
      <h1 class="page">Settings</h1>
      <p class="sub">Manage your account{{ isAdmin ? '' : ', subscription' }} and password.</p>
    </div>
  </div>

  <div class="settings">
    <nav class="card settings-nav" aria-label="Settings sections">
      <button
        v-for="section in sections"
        :key="section.key"
        type="button"
        class="nav-item"
        :class="{ active: section.key === activeKey }"
        :aria-current="section.key === activeKey ? 'page' : undefined"
        @click="openSection(section.key)"
      >
        <b>{{ section.label }}</b>
        <small>{{ section.hint }}</small>
      </button>
    </nav>

    <section class="card pad settings-body">
      <ProfileSettings v-if="activeKey === 'profile'" />
      <SubscriptionSettings v-else-if="activeKey === 'subscription'" />
      <PasswordSettings v-else-if="activeKey === 'password'" />
      <DemoDataSettings v-else />
    </section>
  </div>
</template>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  align-items: start;
}

.settings-nav {
  display: grid;
  padding: 8px;
}

.nav-item {
  display: grid;
  gap: 2px;
  padding: 12px 14px;
  border: 0;
  border-radius: 8px;
  background: none;
  text-align: left;
  color: var(--ink);
}

.nav-item small {
  font-size: 12px;
  color: var(--muted);
}

.nav-item:hover {
  background: var(--bg);
}

.nav-item.active {
  background: var(--gold-l);
}

.nav-item.active b {
  color: var(--gold-d);
}

.settings-body {
  padding: 26px;
  max-width: 760px;
}

/* Phones and tablets: the sections become a row of tabs above the form. */
@media (max-width: 800px) {
  .settings {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    display: flex;
    overflow-x: auto;
  }

  .nav-item {
    flex: 1;
    min-width: 120px;
    text-align: center;
  }

  .nav-item small {
    display: none;
  }
}
</style>
