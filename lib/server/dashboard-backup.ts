import { promises as fs } from 'node:fs'
import path from 'node:path'

// @cdc tableau de bord — dernière sauvegarde de la base (backup-db.sh, cron de l'utilisateur toutou).
// Dossier : DASHBOARD_BACKUP_DIR, défaut /srv/toutou/backups. Seuls date et taille sont exposés.

const FILE = /^toutou-\d{4}-\d{2}-\d{2}\.dump$/
export const BACKUP_MAX_AGE_HOURS = 36

export interface BackupStatus {
  /** false si le dossier est absent ou illisible. */
  readable: boolean
  /** Date ISO de dernière écriture du fichier le plus récent. */
  latest: string | null
  size: number | null
  ageHours: number | null
  /** Copie hors du serveur déclarée par OFFSITE_BACKUP_OK. */
  offsite: boolean
}

export async function getBackupStatus(now = Date.now()): Promise<BackupStatus> {
  const dir = process.env.DASHBOARD_BACKUP_DIR || '/srv/toutou/backups'
  const offsite = Boolean(process.env.OFFSITE_BACKUP_OK)
  const empty = { latest: null, size: null, ageHours: null, offsite }
  try {
    const names = (await fs.readdir(dir)).filter((n) => FILE.test(n))
    const stats = await Promise.all(
      names.map((n) =>
        fs
          .stat(path.join(dir, n))
          .then((s) => ({ mtime: s.mtimeMs, size: s.size }))
          .catch(() => null),
      ),
    )
    const newest = stats.filter((s) => s !== null).sort((a, b) => b.mtime - a.mtime)[0]
    if (!newest) return { readable: true, ...empty }
    return {
      readable: true,
      latest: new Date(newest.mtime).toISOString(),
      size: newest.size,
      ageHours: Math.max((now - newest.mtime) / 3_600_000, 0),
      offsite,
    }
  } catch {
    return { readable: false, ...empty }
  }
}
