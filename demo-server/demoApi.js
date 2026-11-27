// JSON-file storage for the demo, used until the .NET API exists.
// Shared by demo-server/server.js (the hosted demo) and client/vite.config.js (npm run dev),
// so both read and write the same files.
//
// The data lives in demo-server/data/, one file per collection:
//   properties.json, users.json, enquiries.json, documents.json, plan.json, ...
// demo-server/seed/ holds the original sample data. It fills an empty data folder and is used by "Reset demo data".
// Uploaded photos are saved as image files in demo-server/data/uploads/.
//
//   GET    /api/demo-data      all collections as one object
//   PUT    /api/demo-data      write every collection back to its file
//   DELETE /api/demo-data      reset: put the seed data back (uploads removed), returns the fresh data
//   POST   /api/demo-uploads   save one image (raw bytes), returns { url: '/uploads/<name>' }
//   GET    /uploads/<name>     an uploaded image
//
// No accounts or security here: demos only, never real customer data.

import { randomUUID } from 'node:crypto'
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
export const DEFAULT_DATA_DIR = path.join(ROOT, 'data')
const SEED_DIR = path.join(ROOT, 'seed')

const MAX_BODY_BYTES = 25 * 1024 * 1024
const COLLECTION_NAME = /^[a-zA-Z]+$/ // file names come from the data keys, so only allow plain words

const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export function createDemoApi(dataDir = DEFAULT_DATA_DIR) {
  const uploadsDir = path.join(dataDir, 'uploads')

  return async function demoApi(req, res, next) {
    const { pathname } = new URL(req.url, 'http://localhost')

    try {
      if (pathname === '/api/demo-data') {
        if (req.method === 'GET') {
          const data = (await readCollections(dataDir)) || (await copySeed(dataDir))
          return sendJson(res, 200, data)
        }
        if (req.method === 'PUT') {
          await writeCollections(dataDir, JSON.parse(await readBody(req)))
          return sendEmpty(res, 204)
        }
        if (req.method === 'DELETE') {
          await deleteCollections(dataDir)
          await rm(uploadsDir, { recursive: true, force: true })
          return sendJson(res, 200, await copySeed(dataDir))
        }
      }

      if (pathname === '/api/demo-uploads' && req.method === 'POST') {
        const extension = IMAGE_TYPES[req.headers['content-type']]
        if (!extension)
          return sendJson(res, 400, {
            message: 'Only JPG, PNG or WebP images can be uploaded.',
          })

        const fileName = `${randomUUID()}.${extension}`
        await mkdir(uploadsDir, { recursive: true })
        await writeFile(path.join(uploadsDir, fileName), await readBody(req, { raw: true }))
        return sendJson(res, 201, { url: `/uploads/${fileName}` })
      }

      if (pathname.startsWith('/uploads/') && req.method === 'GET') {
        const fileName = path.basename(decodeURIComponent(pathname)) // basename: no "../" tricks
        const extension = path.extname(fileName).slice(1)
        try {
          const file = await readFile(path.join(uploadsDir, fileName))
          res.writeHead(200, {
            'Content-Type': CONTENT_TYPES[extension] || 'application/octet-stream',
          })
          return res.end(file)
        } catch {
          return sendEmpty(res, 404)
        }
      }
    } catch (error) {
      return sendJson(res, 400, { message: error.message })
    }

    next()
  }
}

// { properties: [...], users: [...], ... } from properties.json, users.json, ... or null when there are none.
async function readCollections(dataDir) {
  let fileNames = []
  try {
    fileNames = (await readdir(dataDir)).filter((name) => name.endsWith('.json'))
  } catch {
    return null // the data folder doesn't exist yet
  }
  if (fileNames.length === 0) return null

  const data = {}
  for (const fileName of fileNames) {
    data[path.basename(fileName, '.json')] = JSON.parse(await readFile(path.join(dataDir, fileName), 'utf8'))
  }
  return data
}

// Copies the original sample data into the data folder and returns it.
async function copySeed(dataDir) {
  const seed = await readCollections(SEED_DIR)
  await writeCollections(dataDir, seed)
  return seed
}

async function writeCollections(dataDir, data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Expected an object with one key per collection.')
  }

  await mkdir(dataDir, { recursive: true })
  for (const [name, value] of Object.entries(data)) {
    if (!COLLECTION_NAME.test(name)) throw new Error(`"${name}" is not a valid collection name.`)

    // Write a temporary file, then swap it in, so a crash never leaves half a file.
    const filePath = path.join(dataDir, `${name}.json`)
    await writeFile(`${filePath}.tmp`, JSON.stringify(value, null, 2) + '\n')
    await rename(`${filePath}.tmp`, filePath)
  }
}

async function deleteCollections(dataDir) {
  const fileNames = await readdir(dataDir).catch(() => [])
  for (const fileName of fileNames.filter((name) => name.endsWith('.json'))) {
    await rm(path.join(dataDir, fileName), { force: true })
  }
}

function readBody(req, { raw = false } = {}) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('The upload is too large (25 MB maximum).'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const body = Buffer.concat(chunks)
      resolve(raw ? body : body.toString('utf8'))
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function sendEmpty(res, status) {
  res.writeHead(status)
  res.end()
}
