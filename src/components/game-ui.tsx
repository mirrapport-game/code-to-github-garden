import { useState } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`grid place-items-center rounded-full border border-gold/80 font-display text-gold-gradient ${className}`}>
      <span className="font-semibold leading-none">Я</span>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "gold",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "gold" | "ghost" | "night";
  disabled?: boolean;
  className?: string;
}) {
  const v = {
    gold: "bg-gold-gradient text-accent-foreground shadow-glow hover:brightness-105",
    night: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "border border-gold/60 text-current hover:bg-gold/10",
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full rounded-full px-6 py-4 text-base font-semibold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 ${v} ${className}`}>
      {children}
    </button>
  );
}

export function Stop({ onStop }: { onStop: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed right-4 top-4 z-40 rounded-full bg-destructive px-5 py-2 text-sm font-bold tracking-widest text-destructive-foreground shadow-card">
        СТОП
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-night/70 p-6 backdrop-blur-sm">
          <div className="gold-frame w-full max-w-sm animate-rise rounded-2xl bg-card p-8 text-center shadow-card">
            <h3 className="text-3xl font-semibold">Остановить?</h3>
            <p className="mt-3 text-muted-foreground">Игра останавливается. Ты выходишь без объяснений. Твоя безопасность важнее сцены.</p>
            <div className="mt-6 space-y-3">
              <Btn variant="night" onClick={() => { setOpen(false); onStop(); }}>Да, стоп</Btn>
              <Btn variant="ghost" onClick={() => setOpen(false)}>Продолжить</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Chips({ items, value, onChange }: { items: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => {
        const on = value.includes(i);
        return (
          <button key={i} onClick={() => onChange(on ? value.filter((x) => x !== i) : [...value, i])}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-gold"}`}>
            {i}
          </button>
        );
      })}
    </div>
  );
}
