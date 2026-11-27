import { computed, reactive, watch } from 'vue'
import { db } from './db'
import { PLANS, ROLES } from '@/data/constants'

// Saved in sessionStorage so refreshing the page keeps you signed in.
const STORAGE_KEY = 'sp.session'
const savedSession = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')

export const session = reactive({
  role: savedSession ? savedSession.role : null,
  plan: savedSession ? savedSession.plan : PLANS.FREE,
  email: savedSession ? savedSession.email : '',
})

watch(session, () => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
})

export const isLoggedIn = computed(() => session.role !== null)
export const isAdmin = computed(() => session.role === ROLES.ADMIN)
export const isPro = computed(() => isAdmin.value || session.plan === PLANS.PRO)

// A feature is locked when the user is on the Free plan and the admin has locked it in "Plans & Paywall".
export function isLocked(feature) {
  if (isPro.value) return false
  return db.gates[feature] === true
}

// The signed-in person's profile: the admin profile, or the partner's account (found by email).
export const currentUser = computed(() => {
  if (isAdmin.value) return db.adminProfile
  return db.users.find((user) => user.email.toLowerCase() === session.email.toLowerCase()) || null
})

export const currentUserName = computed(() => currentUser.value?.name || 'Partner')

// "Demo Partner" -> "DP"
export const currentUserInitials = computed(() =>
  currentUserName.value
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

export function signIn(role, plan, email = '') {
  session.role = role
  session.plan = role === ROLES.ADMIN ? PLANS.PRO : plan
  session.email = email
}

export function signOut() {
  session.role = null
  session.plan = PLANS.FREE
  session.email = ''
}

export function setPlan(plan) {
  session.plan = plan
}

export function getHomeRoute(role) {
  if (role === ROLES.ADMIN) return { name: 'admin-dashboard' }
  return { name: 'properties' }
}
