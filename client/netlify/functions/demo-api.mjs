// Netlify version of demo-server/demoApi.js: the same demo API, with Netlify Blobs instead of JSON files,
// because Netlify has no disk to write to. Locally, `npm run dev` still uses the JSON files.
//
//   GET    /api/demo-data      all collections as one object (filled from demo-server/seed the first time)
//   PUT    /api/demo-data      write every collection back
//   DELETE /api/demo-data      reset: put the seed data back (uploads removed), returns the fresh data
//   POST   /api/demo-uploads   save one image (raw bytes), returns { url: '/uploads/<name>' }
//   GET    /uploads/<name>     an uploaded image
//
// No accounts or security here: demos only, never real customer data.

import { randomUUID } from 'node:crypto'
import { getStore } from '@netlify/blobs'
import adminProfile from '../../../demo-server/seed/adminProfile.json'
import disclaimer from '../../../demo-server/seed/disclaimer.json'
import documents from '../../../demo-server/seed/documents.json'
import enquiries from '../../../demo-server/seed/enquiries.json'
import gates from '../../../demo-server/seed/gates.json'
import inclusions from '../../../demo-server/seed/inclusions.json'
import myDealIds from '../../../demo-server/seed/myDealIds.json'
import myListIds from '../../../demo-server/seed/myListIds.json'
import plan from '../../../demo-server/seed/plan.json'
import properties from '../../../demo-server/seed/properties.json'
import purchasingTerms from '../../../demo-server/seed/purchasingTerms.json'
import users from '../../../demo-server/seed/users.json'

const SEED = {
  adminProfile,
  disclaimer,
  documents,
  enquiries,
  gates,
  inclusions,
  myDealIds,
  myListIds,
  plan,
  properties,
  purchasingTerms,
  users,
}

const COLLECTION_NAME = /^[a-zA-Z]+$/
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const CONTENT_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

// strong consistency: a page reload right after a save must see that save.
const dataStore = () => getStore({ name: 'demo-data', consistency: 'strong' })
const uploadStore = () => getStore({ name: 'demo-uploads', consistency: 'strong' })

export default async function demoApi(req) {
  const { pathname } = new URL(req.url)

  try {
    if (pathname === '/api/demo-data') {
      if (req.method === 'GET') return Response.json((await readCollections()) || (await writeSeed()))
      if (req.method === 'PUT') {
        await writeCollections(await req.json())
        return new Response(null, { status: 204 })
      }
      if (req.method === 'DELETE') {
        await clearStore(dataStore())
        await clearStore(uploadStore())
        return Response.json(await writeSeed())
      }
    }

    if (pathname === '/api/demo-uploads' && req.method === 'POST') {
      const extension = IMAGE_TYPES[req.headers.get('content-type')]
      if (!extension)
        return Response.json({ message: 'Only JPG, PNG or WebP images can be uploaded.' }, { status: 400 })

      const fileName = `${randomUUID()}.${extension}`
      await uploadStore().set(fileName, await req.arrayBuffer())
      return Response.json({ url: `/uploads/${fileName}` }, { status: 201 })
    }

    if (pathname.startsWith('/uploads/') && req.method === 'GET') {
      const fileName = pathname.slice('/uploads/'.length)
      const file = await uploadStore().get(fileName, { type: 'arrayBuffer' })
      if (!file) return new Response(null, { status: 404 })
      const extension = fileName.split('.').pop()
      return new Response(file, {
        headers: {
          'Content-Type': CONTENT_TYPES[extension] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable', // file names are unique, so they never change
        },
      })
    }
  } catch (error) {
    return Response.json({ message: error.message }, { status: 400 })
  }

  return new Response(null, { status: 404 })
}

// { properties: [...], users: [...], ... } or null when nothing is stored yet.
async function readCollections() {
  const store = dataStore()
  const { blobs } = await store.list()
  if (blobs.length === 0) return null

  const entries = await Promise.all(blobs.map(async ({ key }) => [key, await store.get(key, { type: 'json' })]))
  return Object.fromEntries(entries)
}

async function writeCollections(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Expected an object with one key per collection.')
  }
  const store = dataStore()
  for (const name of Object.keys(data)) {
    if (!COLLECTION_NAME.test(name)) throw new Error(`"${name}" is not a valid collection name.`)
  }
  await Promise.all(Object.entries(data).map(([name, value]) => store.setJSON(name, value)))
}

async function writeSeed() {
  await writeCollections(SEED)
  return structuredClone(SEED)
}

async function clearStore(store) {
  const { blobs } = await store.list()
  await Promise.all(blobs.map(({ key }) => store.delete(key)))
}

export const config = {
  path: ['/api/demo-data', '/api/demo-uploads', '/uploads/*'],
}
