import { marqueCanonique } from '../lib/scanner/marque'
// Tests des classements : une recette par ligne, noms lisibles, segments.
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { MODEL_REVIEWS, recipeHref } from '../data/model-reviews'
import { inlineParts, inlinePlain } from '../lib/inline-links'
import { extractClassement } from '../lib/mdx'
import { isSupplementName, capByBrand, displayBrand, displayName, recipeKey, recipeName, segmentBySlug } from '../lib/scanner/rankings'

assert.equal(recipeName('Mini Adulte 4 kg'), 'Mini Adulte')
assert.equal(recipeName('ACANA Senior 2x11,4 kg'), 'ACANA Senior')
assert.equal(recipeKey('Royal Canin', 'Mini Adulte 2 kg'), recipeKey('ROYAL CANIN', 'Mini Adulte 8 kg'))
assert.notEqual(recipeKey('Royal Canin', 'Mini Adulte'), recipeKey('Royal Canin', 'Mini Chiot'))
assert.equal(displayName("Hill's Croquettes sèches pour chiot de grande race"), 'Chiot de grande race')
assert.equal(displayName('WILDERNESS croquettes chien, adulte, True Country'), 'Wilderness adulte, True Country')
assert.equal(displayName('Croquettes au canard frais'), 'au canard frais')
assert.equal(displayBrand('REAL NATURE'), 'Real Nature')
assert.equal(displayBrand('Hills'), "Hill's")
assert.equal(displayBrand('Edgard & Cooper'), 'Edgard & Cooper')
assert.equal(capByBrand([{ brand: 'A' }, { brand: 'a' }, { brand: 'A' }, { brand: 'B' }], 2).length, 3)
const r = (name: string, ingredients = ['poulet']) => ({ name, noun: 'croquettes' as const, ingredients, fat: 10 })
const seg = (s: Parameters<typeof segmentBySlug>[0]) => segmentBySlug(s)!
assert.ok(seg('chiot').match(r('Maxi Puppy')))
assert.ok(!seg('adulte').match(r('Maxi Puppy')))
assert.ok(seg('senior').match(r('Adult 7+ Medium')))
assert.ok(seg('petit-chien').match(r('Chihuahua Adulte')))
assert.ok(seg('sterilise').match(r('Sterilised Medium')))
assert.ok(!seg('sans-cereales').match(r('X', ['poulet', 'blé', 'maïs', 'graisse', 'minéraux'])))
assert.ok(seg('sans-cereales').match(r('X', ['poulet', 'pois', 'lentilles', 'graisse', 'minéraux'])))
assert.ok(!seg('friandises').match(r('X')))
const before = extractClassement('<Classement segment="senior" />\n\n## TL;DR\n- a\n\n## Suite\n')
assert.deepEqual([before.segment, before.beforeTldr], ['senior', true])
const after = extractClassement('## TL;DR\n- a\n\n<Classement segment="surpoids" />\n\n## Suite\ntexte')
assert.deepEqual([after.segment, after.beforeTldr], ['surpoids', false])
assert.ok(!after.content.includes('Classement'))
assert.equal(extractClassement('## TL;DR\n').segment, null)
assert.ok(isSupplementName('Compléments Articulations & Vieillissement Friandises'))
assert.ok(!isSupplementName('Sticks Chien Adulte Poulet'))
assert.equal(recipeKey('Dog Chef', 'Croquettes au canard frais 2 kg') in MODEL_REVIEWS, true)
assert.equal(recipeKey('Franklin Pet Food', 'Croquettes Dinde, patate douce, épinards') in MODEL_REVIEWS, true)
assert.equal(recipeHref('dog chef|croquettes au canard frais', 'x'), '/chien/avis-marques/avis-dog-chef-croquettes-canard-frais')
assert.equal(recipeHref('inconnu', 'fiche-x'), '/croquettes/fiche-x')
for (const href of Object.values(MODEL_REVIEWS)) assert.ok(existsSync(`content/blog/${href.split('/').pop()}.mdx`), href)
assert.deepEqual(inlineParts('Voir [la fiche](https://rappel.conso.gouv.fr/x).'), [{ text: 'Voir ' }, { label: 'la fiche', href: 'https://rappel.conso.gouv.fr/x', external: true }, { text: '.' }])
assert.deepEqual(inlineParts('[scanner](/scanner)'), [{ label: 'scanner', href: '/scanner', external: false }])
assert.equal(inlinePlain('Voir [la fiche](/x) ici'), 'Voir la fiche ici')
assert.deepEqual(inlineParts('[x](javascript:alert(1))'), [{ text: '[x](javascript:alert(1))' }])
assert.equal(marqueCanonique('Edgard cooper'), 'Edgard & Cooper')
assert.equal(marqueCanonique('EUKANUBA'), 'Eukanuba')
assert.equal(marqueCanonique("Hill's"), 'Hills')
assert.equal(marqueCanonique('Purina One'), 'Purina One')
assert.equal(marqueCanonique(null), null)
console.log('test-rankings : tout passe')
