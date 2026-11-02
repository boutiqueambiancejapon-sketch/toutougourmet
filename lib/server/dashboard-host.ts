import { promises as fs } from 'node:fs'
import os from 'node:os'

// @cdc tableau de bord — santé de la machine, lue sans privilège : /proc/loadavg, /proc/meminfo,
// statfs sur « / » et os.uptime(). Chaque mesure illisible vaut null (« non disponible »).

export interface Usage {
  used: number
  total: number
}

export interface HostStats {
  cores: number
  /** Charge moyenne sur 1, 5 et 15 min, telle que publiée par le noyau. */
  load: [number, number, number] | null
  /** Mémoire en octets : used = total − disponible. */
  memory: Usage | null
  /** Disque « / » en octets : used = total − libre pour un utilisateur normal. */
  disk: Usage | null
  uptimeSeconds: number | null
}

async function readLoad(): Promise<HostStats['load']> {
  try {
    const parts = (await fs.readFile('/proc/loadavg', 'utf-8')).trim().split(/\s+/).slice(0, 3).map(Number)
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null
    return [parts[0], parts[1], parts[2]]
  } catch {
    return null
  }
}

async function readMemory(): Promise<Usage | null> {
  try {
    const text = await fs.readFile('/proc/meminfo', 'utf-8')
    const kb = (key: string) => {
      const m = new RegExp(`^${key}:\\s+(\\d+) kB`, 'm').exec(text)
      return m ? Number(m[1]) * 1024 : null
    }
    const total = kb('MemTotal')
    const available = kb('MemAvailable')
    if (!total || available === null) return null
    return { used: total - available, total }
  } catch {
    return null
  }
}

async function readDisk(): Promise<Usage | null> {
  try {
    const s = await fs.statfs('/')
    const total = s.blocks * s.bsize
    if (total <= 0) return null
    return { used: total - s.bavail * s.bsize, total }
  } catch {
    return null
  }
}

function readUptime(): number | null {
  try {
    const u = os.uptime()
    return Number.isFinite(u) && u > 0 ? u : null
  } catch {
    return null
  }
}

export async function getHostStats(): Promise<HostStats> {
  const [load, memory, disk] = await Promise.all([readLoad(), readMemory(), readDisk()])
  return { cores: Math.max(os.availableParallelism(), 1), load, memory, disk, uptimeSeconds: readUptime() }
}
