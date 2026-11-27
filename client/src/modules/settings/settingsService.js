// MOCK of the backend account API. The backend team provides the real endpoint:
//   POST /api/account/change-password  { currentPassword, newPassword }
// Replace the body with a fetch call, and throw an Error with a readable message when it fails.

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// The demo accepts any current password; the real API checks it.
export async function changePassword() {
  await wait(600)
}
