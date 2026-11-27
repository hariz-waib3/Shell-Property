import { db } from '@/stores/db'
import { PLANS, ROLES } from '@/data/constants'

// MOCK of the backend login API (POST /api/auth/login). Any password is accepted here;
// the real API checks it. Replace the body of each function with a fetch call, keep
// returning { role, plan }, and throw an Error with a readable message when login fails.

export const DEMO_ACCOUNTS = {
  partnerFree: 'demo@example.com',
  partnerPro: 'alex@example.com',
  admin: 'admin@example.com',
}

const ADMIN_EMAILS = [DEMO_ACCOUNTS.admin]

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function loginPartner(email, password) {
  await wait(500)
  const cleanEmail = email.trim().toLowerCase()

  if (ADMIN_EMAILS.includes(cleanEmail)) {
    throw new Error('This is an admin account. Please use the admin sign-in page.')
  }

  const user = db.users.find((item) => item.email.toLowerCase() === cleanEmail)
  if (!user || !password) {
    throw new Error('Email or password is incorrect.')
  }
  if (user.disabled) {
    throw new Error('This account has been disabled. Please contact support.')
  }

  return { role: ROLES.PARTNER, plan: user.plan }
}

export async function loginAdmin(email, password) {
  await wait(500)
  const cleanEmail = email.trim().toLowerCase()

  if (!ADMIN_EMAILS.includes(cleanEmail) || !password) {
    throw new Error('Email or password is incorrect.')
  }

  return { role: ROLES.ADMIN, plan: PLANS.PRO }
}
