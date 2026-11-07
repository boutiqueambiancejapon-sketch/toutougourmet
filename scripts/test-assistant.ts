import assert from 'node:assert/strict'
import { chercherArticles, mots, texteBrut, type ArticleIndexe } from '../lib/assistant/recherche'

const art = (slug: string, titre: string, tags: string[] = []): ArticleIndexe => ({ slug, url: `/chien/x/${slug}`, titre, tags, description: '', texte: '' })
const liste = [art('chien-peut-manger-noisettes', 'Mon chien peut-il manger des noisettes ?', ['noisette chien']), art('chien-peut-manger-noix', 'Mon chien peut-il manger des noix ?'), art('ration-croquettes', 'Combien de croquettes par jour ?', ['ration croquettes'])]
assert.deepEqual(mots('Mon chien peut-il manger des noisettes ?'), ['noisette'])
assert.equal(chercherArticles(liste, 'mon chien peut il manger une noisette')[0]?.article.slug, 'chien-peut-manger-noisettes')
assert.equal(chercherArticles(liste, 'quelle ration de croquettes pour 10 kg')[0]?.article.slug, 'ration-croquettes')
assert.equal(chercherArticles(liste, 'mon chien aime le tracteur').length, 0)
assert.equal(texteBrut('---\na: 1\n---\n## TL;DR\n- **Oui** [lien](/x)\n<Step title="a">b</Step>\n## Sources\nxx'), 'TL;DR - Oui lien b')
console.log('test-assistant : tout passe')
import { besoinAchat } from '../lib/server/assistant'
assert.equal(besoinAchat('Quelles sont les meilleures croquettes pour un berger ?'), 'croquettes')
assert.equal(besoinAchat('meilleures friandises pour chiot'), 'friandises')
assert.equal(besoinAchat('Quel est le meilleur repas pour mon chien ?'), 'repas')
assert.equal(besoinAchat('Mon chien peut-il manger des noisettes ?'), null)
console.log('besoinAchat : tout passe')
