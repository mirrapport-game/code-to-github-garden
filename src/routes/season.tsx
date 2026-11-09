import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game-ui";
import { LEVEL_META } from "@/lib/cards";
import { SEASON_DAYS, SEASON_LENGTH, nextOpenDay } from "@/lib/season";
import { clearSeason, loadSeason, type SeasonState } from "@/lib/season-store";

export const Route = createFileRoute("/season")({
  head: () => ({
    meta: [
      { title: "Сезон 1: 14 дней саморефлексии — Раппорт ЖиваЯ" },
      { name: "description", content: "Сезон 1 саморефлексии: 14 дней, каждый день — карта и задание. Твои ответы остаются с тобой." },
      { property: "og:title", content: "Сезон 1: 14 дней саморефлексии" },
      { property: "og:description", content: "Каждый день — карта, задание и твои ответы. Ближе к себе, ближе к другим." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Season,
});

function Status({ entry, today, ready }: { entry?: boolean; today?: boolean; ready: boolean }) {
  const label = entry ? "Пройдено" : today ? "Сегодня" : ready ? "Откроется" : "Скоро";
  const tone = entry
    ? "bg-level-soft text-level-foreground"
    : today
      ? "bg-gold-gradient text-accent-foreground"
      : "bg-secondary text-secondary-foreground";
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${tone}`}>{label}</span>;
}

function Season() {
  const [state, setState] = useState<SeasonState | null>(null);

  useEffect(() => {
    setState(loadSeason());
  }, []);

  if (!state) return <main className="min-h-screen bg-background" />;

  const doneDays = Object.keys(state.days).map(Number);
  const today = nextOpenDay(doneDays);
  const passed = doneDays.length;
  const progress = Math.round((passed / SEASON_LENGTH) * 100);
  const hi = state.name.trim() ? `${state.name.trim()}, ` : "";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 pb-16 pt-10">
        <div className="gold-frame animate-rise rounded-2xl bg-night-gradient p-7 text-night-foreground shadow-card">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-12 text-2xl" />
            <div>
              <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-gold-gradient">Сезон 1</h1>
              <p className="text-xs uppercase tracking-[0.3em] text-gold-soft/80">саморефлексия · 14 дней</p>
            </div>
          </div>
          <p className="mt-5 leading-relaxed text-night-foreground/85">
            {hi}каждый день — своя карта и задание. Проходишь день — он остаётся здесь вместе с твоими ответами.
          </p>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-soft/80">Пройдено {passed} из {SEASON_LENGTH}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-night/60">
              <div className="h-full bg-gold-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <ol className="mt-8 space-y-4">
          {SEASON_DAYS.map((d) => {
            const entry = state.days[d.day];
            const isToday = today?.day === d.day;
            return (
              <li key={d.day} className={`animate-rise rounded-2xl border p-5 shadow-card transition ${entry ? "border-gold/70 bg-card" : isToday ? "border-gold bg-card" : "border-border bg-card/70"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-2xl font-semibold">День {d.day}</p>
                  <Status entry={Boolean(entry)} today={isToday} ready={d.ready} />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">{d.stage ?? "Карта не добавлена"}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.task}</p>

                {entry && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <p className={`text-xs font-bold uppercase tracking-widest ${LEVEL_META[entry.level].text}`}>
                      {LEVEL_META[entry.level].label} · {entry.stage}
                    </p>
                    {[
                      ["Что тебя задело", entry.hurt],
                      ["Тень", entry.shadow],
                      ["Ресурс — что можно забрать", entry.resource],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-xs uppercase tracking-[0.2em] text-gold">{k}</p>
                        <p className="mt-1 font-display text-xl leading-snug">{v || "—"}</p>
                      </div>
                    ))}
                    {(entry.feelings.length > 0 || entry.body.length > 0) && (
                      <p className="text-sm text-muted-foreground">
                        Ты заметила: {entry.feelings.join(", ")}{entry.body.length ? ` — ${entry.body.join(", ")}` : ""}
                      </p>
                    )}
                  </div>
                )}

                {isToday && (
                  <Link to="/" className="mt-4 block w-full rounded-full bg-gold-gradient px-6 py-4 text-center text-base font-semibold tracking-wide text-accent-foreground shadow-glow transition hover:brightness-105">
                    Пройти день {d.day}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 space-y-3">
          <Link to="/" className="block w-full rounded-full border border-gold/60 px-6 py-4 text-center text-base font-semibold tracking-wide transition hover:bg-gold/10">
            Вернуться в игру
          </Link>
          {passed > 0 && (
            <button onClick={() => { clearSeason(); setState(loadSeason()); }} className="w-full text-center text-sm text-muted-foreground underline underline-offset-4">
              Начать сезон заново
            </button>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ответы хранятся в этом браузере. Чтобы они были доступны с любого устройства, нужен аккаунт.
        </p>
      </div>
    </main>
  );
}
