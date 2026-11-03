// @cdc sécurité — réponse de /api/contact quand l'adresse est jetable (voir lib/server/disposable-email.ts).

export const DISPOSABLE_MESSAGE = 'Les adresses e-mail temporaires ne sont pas acceptées. Utilise ton adresse habituelle.'

export async function isDisposableRejection(res: Response): Promise<boolean> {
  if (res.status !== 400) return false
  try {
    const body: unknown = await res.json()
    return typeof body === 'object' && body !== null && (body as { error?: unknown }).error === 'Disposable email'
  } catch {
    return false
  }
}
