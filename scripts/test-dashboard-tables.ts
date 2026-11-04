// Vérifie les calculs des onglets Robots et Contenu, sans base : npx tsx scripts/test-dashboard-tables.ts
import assert from 'node:assert/strict'
import { coverageOf, parseRobotFilter, robotHref, splitPaths } from '../lib/dashboard/robots'
import { nightChecks, nightSummary } from '../lib/server/dashboard-logs'

assert.deepEqual(parseRobotFilter('OpenAI', 'ai_user'), { robot: 'OpenAI', kind: 'ai_user' })
assert.deepEqual(parseRobotFilter("x' OR 1=1;--", 'autre'), { robot: null, kind: null }, 'saisie refusée')
assert.deepEqual(parseRobotFilter(['Common Crawl', 'x'], undefined), { robot: 'Common Crawl', kind: null })
assert.equal(robotHref('/b', '?periode=30j', { robot: 'Common Crawl', kind: 'ai_user' }), '/b?periode=30j&robot=Common+Crawl&visite=ai_user')
assert.equal(robotHref('/b', '', { robot: null, kind: null }), '/b')

const articles = [{ path: '/chien/race/a', title: 'A' }, { path: '/chien/race/b', title: 'B' }, { path: '/chien/urgences/c', title: 'C' }]
const cov = coverageOf(articles, ['/chien/race/a/', '/chien/urgences/c', '/outils'])
assert.equal(cov[0].read / cov[0].total, 0.5, 'les moins couvertes d’abord')
assert.equal(cov.reduce((s, r) => s + r.read, 0), 2)

const split = splitPaths([{ label: '/chien/race/a/', value: 3 }, { label: '/outils', value: 2 }], new Map([['/chien/race/a', 'Titre A']]))
assert.deepEqual(split.articles, [{ label: 'Titre A', value: 3 }])
assert.deepEqual(split.others, [{ label: '/outils', value: 2 }])

assert.equal(nightSummary('✓ Poussé sur v2 : abc content(tone): clean up 4 articles (a, b)\n', 'ok'), '4 articles retouchés, publiés.')
assert.equal(nightSummary('✓ Poussé sur v2 : abc content(tone): rewrite 1 article\n✓ Poussé sur v2 : d rewrite 2 articles\n', 'ok'), '3 articles retouchés, publiés.')
assert.equal(nightSummary('✓ Poussé sur v2 : abc content(seo): enrich banane\n', 'ok'), 'Modifications publiées.')
assert.match(nightSummary('', 'error'), /échoué/)
assert.deepEqual(nightChecks('rien\n**À vérifier (non modifiés) :** 22,5 g de protéines\n- à vérifier : la `source`\nÀ vérifier\n'), ['22,5 g de protéines', 'la source', 'À vérifier'])
console.log('test-dashboard-tables : tout passe')
