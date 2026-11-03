import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './index'

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`✅ Server running on http://localhost:${info.port}`)
})
