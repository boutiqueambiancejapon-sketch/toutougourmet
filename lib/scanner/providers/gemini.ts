import { LABEL_INSTRUCTIONS, LABEL_JSON_SCHEMA, type JsonSchema } from '../label-schema'
import { parseExtractedLabel, ScannerError, type LabelImage, type LabelProvider } from '../types'

// @cdc lot 6 — fournisseur Gemini (API REST generateContent, sans SDK) : sortie JSON imposée par
// responseSchema, température 0. Clé GEMINI_API_KEY côté serveur uniquement.
// Modèle : GEMINI_SCANNER_MODEL, par défaut le Flash-Lite le moins cher qui lit les images et
// reste ouvert aux nouveaux comptes : gemini-3.1-flash-lite (0,25 $ / million de jetons en entrée,
// 1,50 $ en sortie, tarif 2026-11). gemini-2.5-flash-lite (moins cher) refuse les nouveaux comptes.

export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite'
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

type GeminiSchema = {
  type: string
  nullable?: boolean
  description?: string
  enum?: string[]
  properties?: Record<string, GeminiSchema>
  required?: string[]
  items?: GeminiSchema
  propertyOrdering?: string[]
}

/** Schéma JSON standard → sous-ensemble OpenAPI attendu par responseSchema. */
export function toGeminiSchema(s: JsonSchema): GeminiSchema {
  const types = Array.isArray(s.type) ? s.type : [s.type]
  const main = types.find((t) => t !== 'null') ?? 'string'
  const out: GeminiSchema = { type: main.toUpperCase() }
  if (types.includes('null')) out.nullable = true
  if (s.description) out.description = s.description
  if (s.enum) out.enum = [...s.enum]
  if (s.properties) {
    out.properties = Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, toGeminiSchema(v)]))
    out.propertyOrdering = Object.keys(s.properties)
  }
  if (s.required) out.required = s.required
  if (s.items) out.items = toGeminiSchema(s.items)
  return out
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
  promptFeedback?: { blockReason?: string }
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
  error?: { code?: number; message?: string; status?: string }
}

export const geminiProvider: LabelProvider = {
  name: 'gemini',
  async extract(images: LabelImage[], signal: AbortSignal) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new ScannerError('unavailable', 'GEMINI_API_KEY manquant')
    const model = process.env.GEMINI_SCANNER_MODEL || DEFAULT_GEMINI_MODEL
    const body = {
      systemInstruction: { parts: [{ text: LABEL_INSTRUCTIONS }] },
      contents: [
        {
          role: 'user',
          parts: [
            ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data.toString('base64') } })),
            { text: 'Recopie cette étiquette au format demandé.' },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(LABEL_JSON_SCHEMA),
        ...(model.startsWith('gemini-2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }
    let res: Response
    try {
      res = await fetch(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal,
        cache: 'no-store',
      })
    } catch (err) {
      if (signal.aborted) throw new ScannerError('timeout', 'Gemini : délai dépassé')
      throw new ScannerError('provider_error', `Gemini injoignable : ${err instanceof Error ? err.message : String(err)}`)
    }
    const json = (await res.json().catch(() => ({}))) as GeminiResponse
    if (!res.ok) throw new ScannerError('provider_error', `Gemini ${res.status} ${json.error?.status ?? ''} ${json.error?.message ?? ''}`.trim())
    const u = json.usageMetadata
    console.info(`[scanner] gemini ${model} jetons entrée=${u?.promptTokenCount ?? '?'} sortie=${u?.candidatesTokenCount ?? '?'}`)
    const candidate = json.candidates?.[0]
    const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    if (!text) throw new ScannerError('provider_error', `Gemini : réponse vide (${json.promptFeedback?.blockReason ?? candidate?.finishReason ?? 'inconnu'})`)
    let raw: unknown
    try {
      raw = JSON.parse(text)
    } catch {
      throw new ScannerError('provider_error', `Gemini : JSON invalide (${candidate?.finishReason ?? 'inconnu'})`)
    }
    return { label: parseExtractedLabel(raw), model: `gemini:${model}` }
  },
}
