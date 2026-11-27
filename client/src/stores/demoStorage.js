// Loads and saves the app data as JSON files until the real API exists.
// The files are in demo-server/data/ (properties.json, users.json, ...); see demo-server/demoApi.js.
// The same API runs inside `npm run dev` (vite.config.js) and on the hosted demo (demo-server/server.js).
//
// Remove this file once the .NET API is connected; stores/db.js will call the API instead.

import { compressImage } from '@/utils/image'

const DATA_URL = '/api/demo-data'
const UPLOAD_URL = '/api/demo-uploads'

let saveTimer = null
let savesInProgress = 0

// Closing or reloading the tab while a change is still being written would lose it, so the browser asks first.
window.addEventListener('beforeunload', (event) => {
  if (saveTimer || savesInProgress > 0) event.preventDefault()
})

async function request(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`Demo data request failed (${response.status}).`)
  return response
}

export async function loadData() {
  const response = await request(DATA_URL)
  return response.json()
}

// Saves are grouped: several changes within 300 ms are written once.
export function saveData(data) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    saveTimer = null
    savesInProgress++
    try {
      await request(DATA_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.warn('Changes could not be saved to the JSON files.', error)
    } finally {
      savesInProgress--
    }
  }, 300)
}

// Puts the original sample data back and returns it.
export async function resetData() {
  clearTimeout(saveTimer)
  saveTimer = null
  const response = await request(DATA_URL, { method: 'DELETE' })
  return response.json()
}

// Saves a photo as a file in demo-server/data/uploads and returns its URL. Large photos are resized first.
export async function uploadImage(file) {
  const image = await compressImage(file)
  const response = await request(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': image.type }, body: image })
  const { url } = await response.json()
  return url
}
