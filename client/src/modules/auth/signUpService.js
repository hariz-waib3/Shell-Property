import { addUser, emailExists } from '@/stores/db'

// MOCK of the backend sign-up API. The backend team provides the real endpoints:
//   POST /api/auth/signup/send-code    { email }
//   POST /api/auth/signup/verify-code  { email, code }
//   POST /api/auth/signup              { email, fullName, mobile, company, ... }
// When they are ready, replace the body of each function with a fetch call.
// Keep the same inputs, and throw an Error with a readable message when something fails.

export const DEMO_CODE = '123456'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendVerificationCode(email) {
  await wait(600)
  if (emailExists(email)) {
    throw new Error('An account with this email already exists. Please sign in instead.')
  }
}

export async function verifyCode(email, code) {
  await wait(500)
  if (code !== DEMO_CODE) {
    throw new Error('That code is incorrect. Please check it and try again.')
  }
}

export async function createPartnerAccount(details) {
  await wait(700)
  addUser({ name: details.fullName, email: details.email, company: details.company })
}
