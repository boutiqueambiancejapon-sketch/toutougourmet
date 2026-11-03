// @cdc tableau de bord — libellé court d'un seau d'histogramme (« 14 h » ou « 03/11 »), à partir
// de la forme AAAA-MM-JJTHH:MM rendue par les requêtes.

export function bucketLabel(bucket: string, hourly: boolean): string {
  const [date, time = ''] = bucket.split('T')
  const [, m, d] = date.split('-')
  return hourly ? `${time.slice(0, 2)} h` : `${d}/${m}`
}
