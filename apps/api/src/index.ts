import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { GoogleGenAI, Type } from '@google/genai'

const app = new Hono()
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

app.use('*', cors())

// --- Request Schema ---
const GenerateRequestSchema = z.object({
  platform: z.string().default('TikTok'),
  niche: z.string(),
  audience: z.string(),
  tone: z.string(),
  format: z.enum(['Singkat', 'Detail']),
  productTitle: z.string().optional(),
  productDescription: z.string().optional(),
  count: z.number().min(1).max(5).default(3),
})

// --- Gemini Response Schema (using @google/genai's Type enum) ---
const hookResponseSchema = {
  type: Type.OBJECT,
  properties: {
    hooks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hookTitle: {
            type: Type.STRING,
            description: 'Judul singkat dari ide konten ini',
          },
          hookScript: {
            type: Type.STRING,
            description: 'Teks spesifik yang harus diucapkan di 3 detik pertama (harus sangat menarik perhatian)',
          },
          bodyBeat: {
            type: Type.STRING,
            description: 'Poin-poin alur isi video dari awal sampai akhir',
          },
          cta: {
            type: Type.STRING,
            description: 'Call to Action yang memancing engagement di akhir video',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3-5 hashtag relevan dan populer',
          },
          estimatedSeconds: {
            type: Type.NUMBER,
            description: 'Estimasi durasi total video dalam detik',
          },
          platformTips: {
            type: Type.STRING,
            description: 'Saran spesifik visual, audio, atau tren platform untuk video ini',
          },
        },
        required: ['hookTitle', 'hookScript', 'bodyBeat', 'cta', 'hashtags', 'estimatedSeconds', 'platformTips'],
      },
    },
  },
  required: ['hooks'],
}

// --- API Route ---
app.post('/v1/generate', zValidator('json', GenerateRequestSchema), async (c) => {
  const { platform, niche, audience, tone, format, productTitle, productDescription, count } = c.req.valid('json')

  const isShort = format === 'Singkat'

  const productContext = productTitle
    ? `\nKONTEK PRODUK/KONTEN:\n- Judul Produk/Video: ${productTitle}${productDescription ? `\n- Deskripsi: ${productDescription}` : ''}`
    : ''

  const prompt = `Kamu adalah seorang Copywriter Sosmed dan Content Strategist ahli untuk platform ${platform}.
Tugasmu adalah membuat hook video pendek dan kerangka naskah yang SANGAT engaging, personal, dan tidak klise.

PREFERENSI KONTEN:
- Niche/Kategori: ${niche}
- Target Audiens: ${audience}
- Nada/Gaya Bahasa: ${tone}${productContext}

INSTRUKSI PENTING:
1. Buat TEPAT ${count} variasi hook dan kerangka video yang BERBEDA satu sama lain.
2. LARANG KERAS gaya klise seperti: "Halo guys!", "5 tips sukses", "Kali ini aku mau share...", "Check this out!".
3. Gunakan salah satu pola psikologi hook ini secara kreatif:
   - Curiosity Gap: "Kenapa [fakta mengejutkan]..." atau "Hal yang semua orang salah paham tentang..."
   - Negative Hook: "Stop [kebiasaan umum] kalau kamu..."
   - Relatable Pain Point: langsung sebut masalah spesifik audiens
   - Bold Statement / Contrarian: pernyataan yang menantang keyakinan umum
   - Story Hook: "Aku hampir [kejadian dramatis] sampai..."
4. hookScript harus ALAMI seperti diucapkan manusia, bukan terasa seperti iklan.
5. Sesuaikan platformTips secara spesifik untuk ${platform} (sound trending, teks overlay, durasi optimal, dll).
6. Format output "${format}": ${
    isShort
      ? 'Isi bodyBeat SINGKAT: 2-3 bullet point ide utama saja (cocok untuk Reels/TikTok 15-30 detik).'
      : 'Isi bodyBeat DETAIL: tulis semua babak video dari awal hingga akhir dalam bullet points (cocok untuk TikTok/video 45-90 detik).'
  }

Balas HANYA dalam format JSON sesuai skema yang diminta.`

  try {
    console.log(`[generate] Request: niche=${niche}, audience=${audience}, tone=${tone}, format=${format}, product=${productTitle || '-'}`)

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: hookResponseSchema,
        temperature: 0.85,
      },
    })

    const text = response.text
    if (!text) {
      console.error('[generate] Empty response from Gemini')
      return c.json({ error: 'Tidak ada respons dari AI. Coba lagi.' }, 500)
    }

    console.log(`[generate] Success, response length: ${text.length}`)
    const jsonResponse = JSON.parse(text)
    return c.json(jsonResponse)
  } catch (error: any) {
    console.error('[generate] Error calling Gemini:', error?.message ?? error)
    return c.json(
      { error: error?.message ?? 'Terjadi kesalahan internal. Coba lagi.' },
      500
    )
  }
})

app.get('/health', (c) => c.text('OK'))

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`✅ Server running on http://localhost:${info.port}`)
})
