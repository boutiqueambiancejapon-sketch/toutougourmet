import Link from 'next/link'
import { BF_CHECKED_AT, BF_DATE, BF_FAQS } from '@/data/black-friday'
import { formatFrDate } from '@/data/promo-codes'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { FaqItem, FaqList } from '@/components/article/Faq'
import { frTypo } from '@/lib/utils'
import { BfOffers } from './BfOffers'

// @cdc affiliation — pilier Black Friday nourriture pour chien : réponse directe, offres confirmées des partenaires,
// conseils d'achat (stock, prix au kilo, prix de référence, box d'essai, transition), FAQ JSON-LD. Rendu serveur.

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'
const P = 'm-0 leading-relaxed text-ink'
const LINK = 'font-semibold text-orange-ink underline underline-offset-4 hover:text-ink'

export function BfPillar() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BF_FAQS.map((f) => ({ '@type': 'Question', name: frTypo(f.q), acceptedAnswer: { '@type': 'Answer', text: frTypo(f.a) } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="v2 mx-auto flex max-w-page flex-col gap-12 px-4 pt-6 pb-16 md:px-8 md:pt-10">
        <div className="flex flex-col gap-6">
          <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Codes promo', href: '/codes-promo' }, { label: 'Black Friday' }]} />
          <header className="flex max-w-prose flex-col gap-3">
            <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
              Black Friday croquettes et nourriture pour chien 2026
            </h1>
            <p className="m-0 text-lg leading-relaxed text-ink-2">
              {frTypo(`Le Black Friday tombe le vendredi ${formatFrDate(BF_DATE)}. Pour nourrir ton chien, les meilleures remises sont souvent déjà là : nos marques partenaires offrent entre −20 et −50 % sur la première commande, sans attendre novembre.`)}
            </p>
            <p className="m-0 text-sm text-ink-2">
              Offres vérifiées le <time dateTime={BF_CHECKED_AT}>{formatFrDate(BF_CHECKED_AT)}</time>. Aucune marque n&apos;avait encore annoncé d&apos;offre Black Friday à cette date.
            </p>
          </header>
          <aside aria-label="En bref" className="flex max-w-prose flex-col gap-2 rounded-card border border-line bg-paper p-5">
            <p className="m-0 font-bold text-ink">En bref</p>
            <ul className="m-0 list-disc space-y-1 pl-6 leading-relaxed text-ink">
              <li>Compare le prix au kilo, pas le pourcentage affiché.</li>
              <li>Un sac ouvert se garde 4 à 6 semaines : achète ce que ton chien finira.</li>
              <li>Une box d&apos;essai à prix cassé est souvent suivie d&apos;un abonnement : note la date.</li>
            </ul>
          </aside>
        </div>

        <section aria-labelledby="offres" className="flex flex-col gap-4">
          <h2 id="offres" className={H2}>Quelles promos sur la nourriture pour chien pendant le Black Friday&nbsp;?</h2>
          <p className={`${P} max-w-prose`}>
            Voici l&apos;offre en cours chez chaque partenaire. Chaque bouton ouvre le site de la marque avec la remise. Si une offre Black Friday plus forte apparaît, le récapitulatif de commande l&apos;affichera.
          </p>
          <BfOffers />
          <p className="m-0 text-sm leading-relaxed text-ink-2">Liens partenaires&nbsp;: on touche une commission si tu commandes, sans surcoût pour toi. Nos notes n&apos;en dépendent pas.</p>
        </section>

        <section aria-labelledby="stock" className="flex max-w-prose flex-col gap-3">
          <h2 id="stock" className={H2}>Faut-il faire un stock de croquettes pendant le Black Friday&nbsp;?</h2>
          <p className={P}>
            Un peu, pas trop. Un sac fermé tient jusqu&apos;à sa date de durabilité, rangé au sec et au frais. Une fois ouvert, l&apos;air attaque les graisses : au bout de 4 à 6 semaines, les croquettes perdent leur odeur et une partie de leurs vitamines, et ton chien boude sa gamelle.
          </p>
          <p className={P}>
            Le bon calcul&nbsp;: un sac que ton chien finit en un mois, et deux ou trois sacs fermés d&apos;avance au plus. Tout est expliqué dans notre guide pour{' '}
            <Link href="/chien/alimentation-quotidienne/conserver-croquettes-chien-guide-oxydation" className={LINK}>bien conserver les croquettes</Link>.
          </p>
        </section>

        <section aria-labelledby="vraie-promo" className="flex max-w-prose flex-col gap-3">
          <h2 id="vraie-promo" className={H2}>Comment savoir si une promo croquettes est vraiment bonne&nbsp;?</h2>
          <p className={P}>
            Divise le prix par le poids du sac. Un 12 kilos à −15 % peut coûter moins cher au kilo qu&apos;un 3 kilos à −30 %. Regarde ensuite le prix barré&nbsp;: en Europe, il doit être le prix le plus bas pratiqué dans les 30 jours avant la promo.
          </p>
          <p className={P}>
            Une remise sur un aliment moyen reste un aliment moyen. Notre page{' '}
            <Link href="/promo-croquettes-chien" className={LINK}>promo croquettes chien</Link> ne garde que les produits notés 70/100 ou plus, et nos{' '}
            <Link href="/meilleures-croquettes" className={LINK}>classements des meilleures croquettes</Link> donnent la note de chaque recette.
          </p>
        </section>

        <section aria-labelledby="box-essai" className="flex max-w-prose flex-col gap-3">
          <h2 id="box-essai" className={H2}>Box d&apos;essai à −50&nbsp;% : où est le piège&nbsp;?</h2>
          <p className={P}>
            Les repas frais livrés à domicile vendent leur première box à prix cassé, puis l&apos;abonnement repart au prix normal. Rien de caché, mais beaucoup l&apos;oublient. Le jour de la commande, mets un rappel deux jours avant le prochain envoi&nbsp;: tu décides alors de continuer, de faire une pause ou d&apos;arrêter.
          </p>
          <p className={P}>
            Lis aussi la durée minimale. Ultra Premium Direct demandait par exemple 2 livraisons au début de novembre. Les conditions de chaque marque sont sur nos pages{' '}
            <Link href="/codes-promo" className={LINK}>codes promo pour chien</Link>.
          </p>
        </section>

        <section aria-labelledby="transition" className="flex max-w-prose flex-col gap-3">
          <h2 id="transition" className={H2}>Changer d&apos;aliment pour une promo&nbsp;: comment faire la transition&nbsp;?</h2>
          <p className={P}>
            L&apos;intestin de ton chien s&apos;habitue à son aliment. Change d&apos;un coup et tu risques des selles molles ou une gamelle boudée. Mélange l&apos;ancien et le nouveau sur une dizaine de jours, en augmentant la part du nouveau petit à petit. Notre{' '}
            <Link href="/chien/alimentation-quotidienne/transition-alimentaire-chien" className={LINK}>protocole de transition jour par jour</Link> donne les proportions.
          </p>
        </section>

        <section aria-labelledby="faq" className="flex max-w-prose flex-col gap-2">
          <h2 id="faq" className={H2}>Questions fréquentes sur le Black Friday pour chien</h2>
          <FaqList>
            {BF_FAQS.map((f) => (
              <FaqItem key={f.q} question={frTypo(f.q)}>
                <p className="m-0">{frTypo(f.a)}</p>
              </FaqItem>
            ))}
          </FaqList>
        </section>
      </div>
    </>
  )
}
