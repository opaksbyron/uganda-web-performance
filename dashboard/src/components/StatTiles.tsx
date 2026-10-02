type Tile = { value: string; label: string; note?: string }

export function StatTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="flex flex-col bg-surface px-5 py-4">
          <dd className="order-1 font-mono text-2xl font-medium tabular-nums text-ink sm:text-3xl">{t.value}</dd>
          <dt className="order-2 mt-1.5 text-xs leading-snug text-muted">{t.label}</dt>
          {t.note ? <p className="order-3 mt-1 text-xs leading-snug text-faint">{t.note}</p> : null}
        </div>
      ))}
    </dl>
  )
}
