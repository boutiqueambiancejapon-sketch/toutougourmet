// Tests de l'année dans les titres, avec un passage au 1er janvier 2027.
import assert from 'node:assert/strict'
import { currentYear, refreshYear, titleWithYear } from '../lib/title-year'

const T = (title: string, category?: string, year = 2027) => titleWithYear(title, category, year)
assert.equal(T('Avis Acana 2026 : composition, prix et alternative'), 'Avis Acana 2027 : composition, prix et alternative')
assert.equal(T('Avis Royal Canin : notre test complet 2026'), 'Avis Royal Canin : notre test complet 2027')
assert.equal(T('Budget alimentation chien : le coût par mois en 2026'), 'Budget alimentation chien : le coût par mois en 2027')
assert.equal(T('Avis croquettes Orlando Lidl : composition et alternatives', 'Avis & Comparatif', 2026), 'Avis croquettes Orlando Lidl 2026 : composition et alternatives')
assert.equal(T('Dog Chef vs Japhy : repas frais ou croquettes ?', 'Avis & Comparatif', 2026), 'Dog Chef vs Japhy 2026 : repas frais ou croquettes ?')
assert.equal(T('Avis Franklin Light Dinde, Patate Douce, Épinards', undefined, 2026), 'Avis Franklin Light Dinde, Patate Douce, Épinards 2026')
assert.equal(T('Les 10 meilleurs légumes à donner à son chien', 'Légumes', 2026), 'Les 10 meilleurs légumes à donner à son chien en 2026')
assert.equal(T('Le chien peut-il manger du melon ?', 'Fruits', 2026), 'Le chien peut-il manger du melon ?')
assert.equal(T('Fondée en 2012 : histoire de la marque', 'Santé'), 'Fondée en 2012 : histoire de la marque')
assert.equal(refreshYear('Avec les seuils FEDIAF 2026 et le règlement UE 2026/1', 2027), 'Avec les seuils FEDIAF 2026 et le règlement UE 2026/1')
assert.equal(refreshYear('Le guide pour bien choisir en 2026.', 2027), 'Le guide pour bien choisir en 2027.')
const long = 'Avis Une Marque Vraiment Très Longue Pour Chien : une accroche beaucoup trop longue'
assert.equal(T(long, undefined, 2026), long)
// Minuit à Paris : le 31 décembre à 23 h 30 UTC, c'est déjà 2027 en France.
assert.equal(currentYear(new Date('2026-12-31T23:30:00Z')), 2027)
assert.equal(currentYear(new Date('2026-12-31T22:30:00Z')), 2026)
console.log('test-title-year : tout passe')
