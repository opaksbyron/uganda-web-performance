import type { ReactNode } from "react"

export function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string
  title: string
  lede?: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20 py-12 sm:py-16">
      <h2 id={`${id}-heading`} className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {lede ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{lede}</p> : null}
      <div className="mt-7">{children}</div>
    </section>
  )
}
