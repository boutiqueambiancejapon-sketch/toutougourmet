import qrcode from 'qrcode-generator'
import { OG_COLORS } from './tokens'

// @cdc lot 6 — QR code en SVG (data URI) pour les images générées par next/og, couleurs du site.
// Correction d'erreur M : reste lisible imprimé petit ou photographié sur un écran.

export function qrDataUri(text: string, color: string = OG_COLORS.ink): string {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount()
  const margin = 2
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + margin} ${r + margin}h1v1h-1z`
  const size = n + margin * 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${OG_COLORS.white}"/><path d="${d}" fill="${color}"/></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
