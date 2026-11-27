<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.png'
import { NAVIGATION } from './navigation'
import { PLANS } from '@/data/constants'
import { currentUserInitials, currentUserName, session, isAdmin, isPro, setPlan, signOut } from '@/stores/session'
import { toast } from '@/stores/ui'

const route = useRoute()
const router = useRouter()

// Only used on small screens, where the nav is hidden behind the menu button.
const menuOpen = ref(false)

const navItems = computed(() => NAVIGATION[session.role] || [])

/* ---------- Profile menu (avatar) ---------- */

const profileOpen = ref(false)
const profileEl = ref(null)

function onDocumentClick(event) {
  if (profileEl.value && !profileEl.value.contains(event.target)) profileOpen.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') profileOpen.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})

// Each route has meta.nav, so "Properties" stays highlighted on a property's detail page too.
function isActive(item) {
  return route.meta.nav === item.name
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

// Demo only: partners can flip between Free and Pro from the profile menu to preview both.
function togglePlan() {
  const newPlan = isPro.value ? PLANS.FREE : PLANS.PRO
  setPlan(newPlan)
  toast(newPlan === PLANS.PRO ? 'Switched to Pro plan (demo)' : 'Switched to Free plan (demo)')
}

function handleSignOut() {
  const loginPage = isAdmin.value ? 'admin-login' : 'login'
  profileOpen.value = false
  signOut()
  router.push({ name: loginPage })
}

// Close the menus after the user picks a page.
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    profileOpen.value = false
  },
)
</script>

<template>
  <header class="top">
    <div class="header-inner">
      <RouterLink :to="{ name: 'home' }">
        <img :src="logo" alt="Shell Property" />
      </RouterLink>

      <nav id="main-nav" :class="{ open: menuOpen }">
        <RouterLink v-for="item in navItems" :key="item.name" :to="{ name: item.name }" :class="{ on: isActive(item) }">
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="who">
        <!-- Profile menu: opened by the avatar. -->
        <div ref="profileEl" class="profile">
          <button
            type="button"
            class="avatar-button"
            aria-haspopup="menu"
            :aria-expanded="profileOpen"
            aria-label="Account menu"
            @click="profileOpen = !profileOpen"
          >
            <span class="avatar">{{ currentUserInitials }}</span>
            <span class="profile-name">{{ currentUserName }}</span>
          </button>

          <Transition name="drop">
            <div v-if="profileOpen" class="profile-menu" role="menu">
              <div class="profile-head">
                <span class="avatar">{{ currentUserInitials }}</span>
                <div>
                  <b>{{ currentUserName }}</b>
                  <span>{{ session.email || (isAdmin ? 'Admin account' : 'Partner account') }}</span>
                </div>
              </div>

              <!-- Partner: current plan, with a demo switch and a link to Plan & Billing. -->
              <div v-if="!isAdmin" class="menu-section">
                <span class="menu-label">Current plan</span>
                <div class="plan-row">
                  <span class="plan-badge" :class="{ pro: isPro }">{{ isPro ? 'Pro' : 'Free' }}</span>
                  <button type="button" class="text-button" @click="togglePlan">
                    Switch to {{ isPro ? 'Free' : 'Pro' }} (demo)
                  </button>
                </div>
                <RouterLink class="menu-item" role="menuitem" :to="{ name: 'billing' }">Plan &amp; Billing</RouterLink>
              </div>

              <div class="menu-section">
                <RouterLink class="menu-item" role="menuitem" :to="{ name: 'settings' }">Settings</RouterLink>
              </div>

              <button type="button" class="menu-item logout" role="menuitem" @click="handleSignOut">Log out</button>
            </div>
          </Transition>
        </div>

        <button
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="main-nav"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="toggleMenu"
        >
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.profile {
  position: relative;
}

.avatar-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 4px 2px 2px;
  border: 0;
  border-radius: 20px;
  background: none;
  color: #b9bcc2;
}

.avatar-button:hover {
  color: #fff;
}

.profile-name {
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
}

.profile-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 260px;
  padding: 8px;
  background: #fff;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(20, 22, 26, 0.18);
  z-index: 40;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 12px;
  border-bottom: 1px solid var(--line);
}

.profile-head b {
  display: block;
  font-size: 13.5px;
}

.profile-head span:not(.avatar) {
  display: block;
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-section {
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}

.menu-label {
  display: block;
  padding: 2px 8px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--muted);
}

.plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 6px;
}

.plan-badge {
  padding: 2px 10px;
  border-radius: 12px;
  background: #efeee9;
  font-size: 12px;
  font-weight: 600;
}

.plan-badge.pro {
  background: var(--ink);
  color: var(--gold);
}

.text-button {
  border: 0;
  padding: 0;
  background: none;
  color: var(--gold-d);
  font-size: 12.5px;
  font-weight: 600;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 6px;
  background: none;
  text-align: left;
  font-size: 13.5px;
  color: var(--ink);
  text-decoration: none;
}

.menu-item:hover {
  background: var(--bg);
}

.menu-item.logout {
  margin-top: 6px;
  color: var(--bad);
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Small screens: avatar only. */
@media (max-width: 600px) {
  .profile-name {
    display: none;
  }
}
</style>
