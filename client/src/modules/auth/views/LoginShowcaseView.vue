<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.png'
import StatusTag from '@/components/common/StatusTag.vue'
import ForgotPasswordForm from '../components/ForgotPasswordForm.vue'
import LoginTypeTabs from '../components/LoginTypeTabs.vue'
import { DEMO_ACCOUNTS, loginAdmin, loginPartner } from '../authService'
import { SUPPORT_EMAIL } from '@/data/constants'
import { db } from '@/stores/db'
import { signIn } from '@/stores/session'
import { formatPrice, packagePrice, placeholderImage } from '@/utils/format'

const route = useRoute()
const router = useRouter()

// One page for both logins. auth/routes.js passes portal = 'partner' (/login) or 'admin' (/admin/login).
// mode = 'forgot' (/forgot-password, /admin/forgot-password) shows the password reset steps instead of the sign-in form.
const props = defineProps({
  portal: { type: String, default: 'partner' },
  mode: { type: String, default: 'sign-in' },
})

const isAdminLogin = computed(() => props.portal === 'admin')

// POC only: the form starts filled with a demo account, so you can sign in with one click.
function getDemoEmail() {
  return isAdminLogin.value ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.partnerFree
}

const email = ref(getDemoEmail())
const password = ref('demo1234')

const showPassword = ref(false)
const error = ref('')
const isSigningIn = ref(false)

const emailPlaceholder = computed(() => (isAdminLogin.value ? 'name@shellproperty.com.au' : 'you@agency.com.au'))

// Three sample listings shown as a preview on the left-hand side.
const previewProperties = computed(() => db.properties.filter((p) => p.active && p.status === 'Available').slice(0, 3))

// Cover photo when there is one, otherwise a coloured placeholder.
function coverStyle(property) {
  const cover = property.images?.[0]
  if (!cover) return { background: placeholderImage(property.id) }
  return { backgroundImage: `url("${cover.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

// Switching between the Partner and Admin tabs keeps this page open, so refill the form for that tab.
watch(
  () => props.portal,
  () => {
    email.value = getDemoEmail()
    password.value = 'demo1234'
    error.value = ''
    showPassword.value = false
  },
)

async function handleSignIn() {
  error.value = ''

  if (!email.value.trim() || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }

  isSigningIn.value = true
  try {
    const login = isAdminLogin.value ? loginAdmin : loginPartner
    const account = await login(email.value, password.value)
    signIn(account.role, account.plan, email.value.trim())
  } catch (err) {
    error.value = err.message
    return
  } finally {
    isSigningIn.value = false
  }

  // If the user was sent here from a protected page, take them back to it.
  const redirectTo = route.query.redirect
  if (typeof redirectTo === 'string') {
    router.push(redirectTo)
    return
  }

  router.push({ name: isAdminLogin.value ? 'admin-dashboard' : 'properties' })
}
</script>

<template>
  <section class="showcase-login">
    <!-- Left: product preview -->
    <div class="preview-side">
      <img :src="logo" alt="Shell Property" class="logo preview-logo" />

      <div class="preview-text">
        <p class="eyebrow">For agents &amp; buyer's advocates</p>
        <h2>Every package, <b>priced and verified</b>, before your buyer asks.</h2>
      </div>

      <div class="cards" aria-hidden="true">
        <article
          v-for="(property, index) in previewProperties"
          :key="property.id"
          class="preview-card"
          :class="`card-${index + 1}`"
        >
          <div class="photo" :style="coverStyle(property)">
            <span v-if="property.incentive" class="tag t-ok">{{ property.incentive }}</span>
          </div>
          <div class="body">
            <div class="row">
              <b class="grow">{{ property.suburb }}, {{ property.state }}</b>
              <StatusTag :status="property.status" />
            </div>
            <div class="muted text-sm">{{ property.lot }} · {{ property.estate }}</div>
            <div class="specs">{{ property.beds }} bd · {{ property.baths }} ba · {{ property.cars }} car</div>
            <div class="price-row">
              <span class="price-blur">{{ formatPrice(packagePrice(property)) }}</span>
              <span class="price-note">Sign in to see price</span>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Right: sign-in form -->
    <div class="form-side">
      <!-- Only shown on small screens, where the left panel is hidden. -->
      <img :src="logo" alt="Shell Property" class="logo mobile-logo" />

      <ForgotPasswordForm v-if="mode === 'forgot'" :portal="portal" />

      <form v-else class="form-box auth-form" novalidate @submit.prevent="handleSignIn">
        <h1>Sign in</h1>
        <p class="muted subtitle">Choose a role to preview each side of the portal.</p>

        <LoginTypeTabs />

        <!-- Each label sits inside its box, above the value (see "Input boxes" in the styles). -->
        <div class="input-box" :class="{ invalid: error }">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="username"
            :placeholder="emailPlaceholder"
          />
        </div>

        <div class="input-box has-toggle" :class="{ invalid: error }">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="show-toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <div class="forgot-row">
          <RouterLink class="text-link" :to="{ name: isAdminLogin ? 'admin-forgot-password' : 'forgot-password' }">
            Forgot password?
          </RouterLink>
        </div>

        <div v-if="error" class="field-error form-error" role="alert">{{ error }}</div>

        <button type="submit" class="btn primary block submit" :disabled="isSigningIn">
          <template v-if="isSigningIn">Signing in…</template>
          <template v-else>Sign in <span aria-hidden="true">→</span></template>
        </button>

        <!-- Always one line on both tabs, so the form keeps the same height when switching. -->
        <p v-if="isAdminLogin" class="muted sign-up">Admin accounts are set up by the Shell Property team.</p>
        <p v-else class="muted sign-up">
          New to Shell Property?
          <RouterLink :to="{ name: 'sign-up' }">Create a partner account</RouterLink>
        </p>
      </form>

      <div class="form-footer">
        <small class="footnote">Proof of concept · sample data only</small>
        <small class="support">
          Need help? <a :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>
        </small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.showcase-login {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
}

/* ---------- Left: preview ---------- */
.preview-side {
  position: relative;
  overflow: hidden;
  padding: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40px;
  color: #fff;
  /* Dark brand background (same ink colour as the app header) with a soft gold glow and faint dot grid. */
  background:
    radial-gradient(circle at 80% 15%, rgba(176, 141, 87, 0.28), transparent 45%),
    radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px) 0 0 / 22px 22px,
    var(--ink);
}

.logo {
  width: 140px;
}

.preview-logo {
  position: absolute;
  top: 40px;
  left: 56px;
}

.eyebrow {
  color: var(--gold);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.preview-text h2 {
  font-size: 32px;
  font-weight: 300;
  line-height: 1.25;
  max-width: 520px;
}

.preview-text h2 b {
  font-weight: 600;
  color: var(--gold);
}

/* Three cards, slightly overlapped and tilted, floating gently. */
.cards {
  position: relative;
  height: 360px;
}

.preview-card {
  position: absolute;
  width: 300px;
  background: #fff;
  color: var(--ink);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  left: 0;
  top: 40px;
  rotate: -4deg;
}

.card-2 {
  left: 34%;
  top: 0;
  z-index: 2;
  animation-delay: -2s;
}

.card-3 {
  left: 62%;
  top: 70px;
  rotate: 4deg;
  animation-delay: -4s;
}

@keyframes float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-card {
    animation: none;
  }
}

.photo {
  height: 140px;
  padding: 10px;
}

.body {
  padding: 14px 16px 16px;
}

.specs {
  margin-top: 8px;
  font-size: 13px;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.price-blur {
  font-weight: 600;
  filter: blur(5px);
}

.price-note {
  font-size: 12px;
  color: var(--gold-d);
  font-weight: 600;
}

/* ---------- Right: form ---------- */
.form-side {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 56px;
}

/* The logo is white-on-transparent, so on the white form side it sits on a dark badge. */
.mobile-logo {
  display: none;
  background: var(--ink);
  border-radius: 10px;
  padding: 8px 14px;
  align-self: flex-start;
}

.form-box {
  width: 100%;
  max-width: 400px;
  margin: auto;
}

.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin: -6px 0 16px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.footnote {
  color: var(--muted);
}

.support {
  color: var(--muted);
}

.support a {
  color: var(--ink2);
  font-weight: 600;
  text-decoration: none;
}

.support a:hover {
  color: var(--gold-d);
  text-decoration: underline;
}

/* ---------- Responsive ---------- */
@media (max-width: 1200px) {
  .card-3 {
    display: none;
  }

  .card-2 {
    left: 40%;
  }
}

@media (max-width: 900px) {
  .showcase-login {
    grid-template-columns: 1fr;
  }

  .preview-side {
    display: none;
  }

  .mobile-logo {
    display: block;
  }

  .form-side {
    padding: 28px 20px;
  }
}
</style>
