import Link from 'next/link'

// @cdc lot 6 — AI Act (règlement UE 2024/1689, art. 50) : dire clairement que la lecture de
// l'étiquette est faite par une IA et peut contenir des erreurs. La note, elle, vient de notre barème.

export function AiNotice({ reviewed = false }: { reviewed?: boolean }) {
  return (
    <p className="m-0 rounded-box border border-line bg-paper p-3 text-sm leading-relaxed text-ink-2">
      {reviewed ? (
        <>La lecture de l&apos;étiquette a été faite par une IA, puis relue par la rédaction. </>
      ) : (
        <>
          <strong className="font-semibold text-ink">Lecture automatique.</strong> Une IA a lu l&apos;étiquette et peut se tromper
          (chiffre mal lu, ingrédient oublié). Compare avec ton paquet.{' '}
        </>
      )}
      La note est calculée par notre barème, publié sur la page du{' '}
      <Link href="/scanner#methode" className="font-semibold text-orange-ink underline underline-offset-2">
        scanner
      </Link>
      .
    </p>
  )
}
