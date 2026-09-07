export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="font-serif text-4xl text-primary">{value}</div>
      <div className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  )
}
