import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const HookResponseSchema = z.object({
  hooks: z.array(
    z.object({
      hookTitle: z.string().describe("Judul singkat dari ide konten ini"),
      hookScript: z.string().describe("Teks spesifik yang harus diucapkan di 3 detik pertama"),
      bodyBeat: z.string().describe("Poin-poin alur isi video secara singkat atau detail"),
      cta: z.string().describe("Call to Action di akhir video"),
      hashtags: z.array(z.string()).describe("3-5 hashtag yang relevan"),
      estimatedSeconds: z.number().describe("Estimasi durasi video dalam detik"),
      platformTips: z.string().describe("Saran visual atau audio spesifik")
    })
  )
});

export type HookResponse = z.infer<typeof HookResponseSchema>;

// Convert to JSON Schema for the Gemini API
// Gemini expects a JSON Schema without $schema and definitions sometimes, 
// but zodToJsonSchema is usually compatible if we use the 'Type' enum matching standard json schema.
export const HookResponseJSONSchema = zodToJsonSchema(HookResponseSchema, { target: "jsonSchema7" });
