import { IconPhone } from '@/components/icons'
import type { SitterViewModel } from '@/lib/garde/view'

// @cdc fiche de garde — boutons d'appel (liens tel:) : propriétaire, vétérinaire, centre
// antipoison du pays de la garde en rouge (data/poison-centers.ts).

function Call({ title, detail, phone, tel, urgent = false }: { title: string; detail: string; phone: string; tel: string; urgent?: boolean }) {
  return (
    <li className={`flex items-center justify-between gap-3 rounded-box border-2 bg-paper px-3 py-2.5 ${urgent ? 'border-rose-ink' : 'border-ink'}`}>
      <span className="flex min-w-0 flex-col">
        <strong className="font-display text-lg font-black leading-tight text-ink">{title}</strong>
        <span className="text-sm text-ink-2">
          {detail ? `${detail} · ` : null}
          <span className="whitespace-nowrap">{phone}</span>
        </span>
      </span>
      <a
        href={tel}
        className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-control px-3 text-[15px] font-semibold text-cream no-underline ${urgent ? 'bg-rose-ink' : 'bg-ink'}`}
      >
        <IconPhone className="size-4" />
        Appeler
      </a>
    </li>
  )
}

export function SitterCalls({ m }: { m: SitterViewModel }) {
  return (
    <div className="flex flex-col gap-2">
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        <Call title={m.owner.label} detail="" phone={m.owner.phone} tel={m.owner.tel} />
        {m.vet ? <Call title={m.vet.label} detail="Son vétérinaire" phone={m.vet.phone} tel={m.vet.tel} /> : null}
        {m.poison.map((c) => (
          <Call key={c.tel} title={"Il a avalé quelque chose\u00a0?"} detail={`${c.name} ${c.city}${c.hours ? `, ${c.hours}` : ''}`} phone={c.phone} tel={`tel:${c.tel}`} urgent />
        ))}
      </ul>
      {m.poisonAdvice ? <p className="m-0 text-sm text-ink-2">{m.poisonAdvice}</p> : null}
    </div>
  )
}
