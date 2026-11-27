import { reactive, watch } from 'vue'
import { loadData, resetData, saveData } from './demoStorage'
import { todayIso } from '@/utils/format'

// All app data, loaded from the JSON files in demo-server/data (properties.json, users.json, ...).
// Every change is saved back to those files automatically (see demoStorage.js).
// When the .NET API is ready, the functions below will call it instead.
export const db = reactive({})

let nextId = 1000

// Called once in main.js, before the app is shown.
export async function initDb() {
  Object.assign(db, upgradeData(await loadData()))
  nextId = firstFreeId()
  watch(db, () => saveData(db), { deep: true })
}

export async function resetDemoData() {
  Object.assign(db, upgradeData(await resetData()))
  nextId = firstFreeId()
}

// Brings data saved by an older version of the app up to date, so old JSON files keep working.
// Status "Hidden" became a separate switch: active = false (disabled), status = "Available".
function upgradeData(data) {
  data.properties.forEach((property) => {
    if (property.active === undefined) property.active = property.status !== 'Hidden'
    if (property.status === 'Hidden') property.status = 'Available'
  })
  return data
}

// New records get ids above every id already in use.
function firstFreeId() {
  const ids = [db.properties, db.users, db.enquiries, db.documents].flat().map((item) => item.id)
  return Math.max(1000, ...ids) + 1
}

// Properties

export function findProperty(id) {
  return db.properties.find((property) => property.id === id)
}

// Returns the new property id.
export function addProperty(data) {
  const id = nextId++
  db.properties.unshift({ ...data, id, verified: todayIso() })
  return id
}

export function updateProperty(id, data) {
  Object.assign(findProperty(id), data, { verified: todayIso() })
}

export function deleteProperty(id) {
  db.properties = db.properties.filter((property) => property.id !== id)
}

// Inactive properties are kept for admin but hidden from partners.
export function setPropertyActive(id, active) {
  findProperty(id).active = active
}

export function setPropertyStatus(id, status) {
  findProperty(id).status = status
}

// My Lists

export function isInMyList(propertyId) {
  return db.myListIds.includes(propertyId)
}

export function addToMyList(propertyId) {
  db.myListIds.push(propertyId)
}

export function removeFromMyList(propertyId) {
  db.myListIds = db.myListIds.filter((id) => id !== propertyId)
}

// Enquiries and deals

export function findEnquiry(id) {
  return db.enquiries.find((enquiry) => enquiry.id === id)
}

// `user` is the partner's name (the signed-in user). `detail` is the one-line summary shown in lists.
// Optional: propertyId, requestType and message (property enquiries), answers (sourcing requests).
export function addEnquiry({ user, kind, ref, detail, stage, ...extra }) {
  const enquiry = { id: nextId++, user, kind, ref, detail, stage, date: todayIso(), ...extra }
  db.enquiries.unshift(enquiry)
  db.myDealIds.unshift(enquiry.id)
}

export function setEnquiryStage(id, stage) {
  const enquiry = db.enquiries.find((item) => item.id === id)
  enquiry.stage = stage
}

// Documents

export function addDocument({ title, category, description }) {
  db.documents.unshift({ id: nextId++, title, category, description, size: '—' })
}

export function deleteDocument(id) {
  db.documents = db.documents.filter((doc) => doc.id !== id)
}

// Subscribers

export function findUser(id) {
  return db.users.find((user) => user.id === id)
}

// Enquiries point at the partner by name in this mock data, so keep them linked after a rename.
// (The backend links them by user id.)
export function updateUser(id, data) {
  const user = findUser(id)
  db.enquiries.forEach((enquiry) => {
    if (enquiry.user === user.name) enquiry.user = data.name
  })
  Object.assign(user, data)
}

export function updateAdminProfile(data) {
  Object.assign(db.adminProfile, data)
}

export function setUserStatus(id, status) {
  findUser(id).status = status
}

// A disabled partner can't sign in. Their data is kept, so the account can be enabled again.
export function setUserDisabled(id, disabled) {
  findUser(id).disabled = disabled
}

export function setUserPlan(id, plan) {
  const user = db.users.find((item) => item.id === id)
  user.plan = plan
}

export function addUser({ name, email, company }) {
  db.users.unshift({ id: nextId++, name, email, company, plan: 'free', status: 'Active', since: todayIso() })
}

// `exceptId`: ignore this user, so a partner keeping their own email is not a clash.
export function emailExists(email, exceptId = null) {
  return db.users.some((user) => user.id !== exceptId && user.email.toLowerCase() === email.toLowerCase())
}
