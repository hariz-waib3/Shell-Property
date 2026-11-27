// MOCK of the backend password reset API. The backend team provides the real endpoints:
//   POST /api/auth/password-reset/send-code    { email }
//   POST /api/auth/password-reset/verify-code  { email, code }
//   POST /api/auth/password-reset              { email, code, newPassword }
// When they are ready, replace the body of each function with a fetch call.
// Keep the same inputs, and throw an Error with a readable message when something fails.

export const DEMO_RESET_CODE = '123456'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// The API answers the same way whether or not the email has an account,
// so nobody can use this form to find out who is registered.
export async function sendResetCode() {
  await wait(600)
}

export async function verifyResetCode(email, code) {
  await wait(500)
  if (code !== DEMO_RESET_CODE) {
    throw new Error('That code is incorrect or has expired. Please try again.')
  }
}

export async function resetPassword() {
  await wait(700)
}
