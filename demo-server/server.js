// Hosted demo: serves the built client (client/dist) and the JSON-file storage from demoApi.js.
// Run `npm run build` in /client first, then `npm start` here.

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDemoApi, DEFAULT_DATA_DIR } from './demoApi.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const CLIENT_DIST = path.join(ROOT, '..', 'client', 'dist')
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR
const PORT = process.env.PORT || 3001

const app = express()

app.use(createDemoApi(DATA_DIR))

// The client app. Any other path returns index.html, so Vue Router handles it (e.g. /admin/properties/12).
app.use(express.static(CLIENT_DIST))
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Shell Property demo running on http://localhost:${PORT}`)
  console.log(`Data folder: ${DATA_DIR}`)
})
