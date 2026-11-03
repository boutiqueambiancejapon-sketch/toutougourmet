// @cdc compte — classes partagées de l'espace compte : boutons et liens (cibles de 44 px au moins).
// Un libellé de bouton ne passe jamais sur deux lignes (whitespace-nowrap) ; les boutons d'action
// prennent toute la largeur sur téléphone. Les variantes *Block restent pleine largeur partout.

const base = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control px-4 text-base font-semibold no-underline'
const fluid = 'w-full sm:w-auto'

export const btnPrimaryBlock = `${base} w-full bg-orange text-ink hover:underline`
export const btnOutlineBlock = `${base} w-full border-2 border-ink bg-paper text-ink hover:underline`

export const btnPrimary = `${base} ${fluid} bg-orange text-ink hover:underline`
export const btnDark = `${base} ${fluid} bg-ink text-cream hover:underline`
export const btnOutline = `${base} ${fluid} border-2 border-ink bg-paper text-ink hover:underline`
export const btnDanger = `${base} ${fluid} border-2 border-orange-ink bg-paper text-orange-ink hover:underline`
export const linkInline = 'font-semibold text-orange-ink underline underline-offset-2'
export const linkAction = 'inline-flex min-h-11 items-center gap-1 text-base font-semibold text-orange-ink underline underline-offset-2'
