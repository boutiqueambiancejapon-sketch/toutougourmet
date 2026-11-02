'use client'

// @cdc lot 4 — suppression d'un chien et de ses pesées, après confirmation.
export function DeleteDogButton({ action, name }: { action: () => Promise<void>; name: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Supprimer ${name} et toutes ses pesées ? Ce n'est pas réversible.`)) e.preventDefault()
      }}
      className="border-t border-line pt-4"
    >
      <button type="submit" className="min-h-11 text-[15px] font-semibold text-orange-ink underline underline-offset-2">
        {`Supprimer ${name}`}
      </button>
    </form>
  )
}
