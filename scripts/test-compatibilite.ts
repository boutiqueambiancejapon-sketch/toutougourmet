import assert from 'node:assert/strict'
import { verifierPourChien, type ChienProfil, type ProduitProfil } from '../lib/scanner/compatibilite'

const chien = (p: Partial<ChienProfil> = {}): ChienProfil => ({ id: 'a', name: 'Rex', age: 'adulte', weightKg: 20, activity: 'normal', sterilized: false, allergies: [], ...p })
const produit = (p: Partial<ProduitProfil> = {}): ProduitProfil => ({ nom: 'Marque Adult Poulet', friandise: false, ingredients: ['poulet', 'riz'], protDm: 30, fatDm: 15, alertes: [], veterinaire: false, ...p })

assert.equal(verifierPourChien(produit(), chien()).statut, 'convient')
assert.equal(verifierPourChien(produit(), chien({ allergies: ['poulet'] })).statut, 'eviter')
assert.equal(verifierPourChien(produit({ nom: 'Marque Puppy' }), chien()).statut, 'verifier')
assert.equal(verifierPourChien(produit(), chien({ age: 'chiot', weightKg: 5 })).statut, 'verifier')
assert.equal(verifierPourChien(produit({ protDm: 16 }), chien()).statut, 'verifier')
assert.equal(verifierPourChien(produit({ nom: 'Marque Mini Adult' }), chien({ weightKg: 30 })).statut, 'verifier')
assert.equal(verifierPourChien(produit({ fatDm: 35 }), chien({ activity: 'sedentaire' })).statut, 'verifier')
assert.equal(verifierPourChien(produit({ fatDm: 35 }), chien()).statut, 'convient')
assert.equal(verifierPourChien(produit({ alertes: ['Alerte'] }), chien()).statut, 'verifier')
assert.equal(verifierPourChien(produit({ veterinaire: true }), chien()).statut, 'verifier')
assert.equal(verifierPourChien(produit({ nom: 'Friandise Mini', friandise: true, protDm: 5 }), chien({ weightKg: 40 })).statut, 'convient')
assert.deepEqual(verifierPourChien(produit(), chien({ age: null, weightKg: null })).manque, ['sa date de naissance', 'son poids'])
console.log('test-compatibilite : tout passe')
