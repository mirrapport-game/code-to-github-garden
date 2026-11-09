import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import box from "@/assets/rapport_box.webp.asset.json";
import cardsPhoto from "@/assets/rapport_cards.webp.asset.json";
import { Btn, Chips, Logo, Stop } from "@/components/game-ui";
import { BODY, FEELINGS, LEVEL_META, drawCard, type GameCard, type LevelKey } from "@/lib/cards";
import { loadSeason, saveSeasonDay, saveSeasonName } from "@/lib/season-store";
import { IntroTrainer } from '@/components/intro-trainer';
import { clearTrainer, loadTrainer } from '@/lib/intro-trainer';
import { PLAYABLE_CARDS } from '@/lib/official-cards';
import type { UIMessage } from 'ai';
import type { DialogueTurn } from '@/lib/intro-dialogue';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Раппорт: ЖиваЯ — вытяни свою карту" },
      { name: "description", content: "Вытяни карту, попробуй диалог и заметь свои чувства. Ближе к себе, ближе к другим." },
      { property: "og:title", content: "Раппорт: ЖиваЯ — вытяни свою карту" },
      { property: "og:description", content: "Игра-зеркало для женщин. Без оценок и советов." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step = "intro" | "card" | "level" | "questions" | "dialogue" | "cta";

function CoverView({ card }: { card: GameCard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="mx-auto w-full max-w-xs animate-flip [perspective:1200px]">
      <button
        onClick={() => setFlipped((f) => !f)}
        aria-label="Перевернуть карту"
        className={`relative block aspect-[2/3] w-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        <img src={card.cover} alt={`Карта «${card.stage}»`} className="gold-frame absolute inset-0 h-full w-full rounded-2xl object-cover shadow-card [backface-visibility:hidden]" />
        <div className="gold-frame absolute inset-0 flex flex-col justify-center gap-4 overflow-auto rounded-2xl bg-card p-6 text-center shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="mx-auto rounded-md bg-level-soft px-3 py-0.5 font-display text-xs uppercase tracking-[0.3em] text-level-foreground">Этап</span>
          <p className="font-display text-2xl font-semibold uppercase">{card.stage}</p>
          <p className="font-display text-xl font-semibold text-level-hard">{card.scenario}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{card.context}</p>
        </div>
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">Нажми на карту, чтобы перевернуть</p>
    </div>
  );
}

function ScenarioHeader({ card }: { card: GameCard }) {
  return (
    <div className="text-center">
      <span className="rounded-md bg-level-soft px-4 py-1 font-display text-sm uppercase tracking-[0.3em] text-level-foreground">Этап</span>
      <h2 className="mt-3 text-3xl font-semibold uppercase tracking-wide">{card.stage}</h2>
      <p className="mt-4 font-display text-2xl font-semibold text-level-hard">{card.scenario}</p>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [card, setCard] = useState<GameCard | null>(null);
  const [level, setLevel] = useState<LevelKey | null>(null);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [body, setBody] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [dialogue, setDialogue] = useState<DialogueTurn[]>([]);
  const [trainerMessages, setTrainerMessages] = useState<UIMessage[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const hi = name.trim() ? `${name.trim()}, ` : "";

  useEffect(() => {
    const saved = loadSeason();
    setName(saved.name);
    const trainer = loadTrainer();
    const savedCard = PLAYABLE_CARDS.find(c => c.id === trainer?.cardId);
    if (trainer && savedCard && trainer.messages.length) {
      setCard(savedCard); setLevel(trainer.level); setTrainerMessages(trainer.messages); setAiSummary(trainer.summary); setStep('dialogue');
    }
  }, []);

  const reset = () => {
    clearTrainer();
    setStep("intro");
    setCard(null);
    setLevel(null);
    setFeelings([]);
    setBody([]);
    setDialogue([]);
    setTrainerMessages([]); setAiSummary('');
  };

  const draw = () => {
    clearTrainer();
    saveSeasonName(name.trim());
    const next = drawCard(card ?? undefined) ?? null;
    setCard(next);
    setLevel(null);
    setFeelings([]);
    setBody([]);
    setDialogue([]);
    setTrainerMessages([]); setAiSummary('');
    setStep("card");
  };

  const finishDay = (completedDialogue = dialogue, completedSummary = aiSummary) => {
    if (card && level) {
        saveSeasonName(name.trim());
        saveSeasonDay({
          day: 1,
          stage: card.stage,
          level,
          feelings,
          body,
           hurt: '',
           shadow: '',
           resource: '',
          cardId: card.id,
           dialogue: completedDialogue,
           aiSummary: completedSummary,
          doneAt: new Date().toISOString(),
        });
    }
    clearTrainer();
    setStep("cta");
  };

  if (step === "intro") {
    return (
      <main className="min-h-screen bg-night-gradient text-night-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
          <div className="flex flex-col items-center text-center animate-rise">
            <Logo className="h-16 w-16 text-4xl" />
            <h1 className="mt-5 text-5xl font-semibold leading-none text-gold-gradient">Раппорт</h1>
            <p className="mt-1 font-display text-3xl italic text-gold-soft">— ЖиваЯ —</p>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-gold-soft/80">ближе к себе · ближе к другим</p>
          </div>
          <img src={box.url} alt="Коробка игры Раппорт ЖиваЯ" className="mt-8 rounded-2xl gold-frame shadow-card animate-rise" />
          <div className="mt-8 space-y-3 rounded-2xl border border-gold/30 bg-night/40 p-6 text-[15px] leading-relaxed animate-rise">
            <p>✦ Ты играешь роль, а не себя.</p>
            <p>✦ Здесь нет правильных ответов.</p>
            <p>✦ Если страшно — нажми <b className="text-gold">СТОП</b>. Без объяснений.</p>
          </div>
          <div className="mt-8 space-y-3">
            <label className="block text-center font-display text-xl italic text-gold-soft">Как к тебе можно обращаться?</label>
            <input aria-label="Твоё имя" value={name} onChange={(e) => setName(e.target.value)} placeholder="Твоё имя" className="w-full rounded-full border border-gold/50 bg-night/40 px-6 py-4 text-center text-lg outline-none placeholder:text-night-foreground/40 focus:border-gold" />
            {name.trim() && <Btn onClick={draw}>Вытянуть карту</Btn>}
          </div>
          <p className="mt-4 text-center text-xs text-night-foreground/60">Это игра-зеркало, а не психотерапия.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Stop onStop={reset} />
      <div className="mx-auto max-w-md px-6 pb-16 pt-20">
        {step === "card" && card && (
          <div className="space-y-8">
            <CoverView card={card} />
            <div className="space-y-3">
              <Btn onClick={() => setStep("level")}>Открыть карту</Btn>
              <Btn variant="ghost" onClick={draw}>Вытянуть другую</Btn>
            </div>
          </div>
        )}

        {step === "level" && card && (
          <div className="space-y-6 animate-rise">
            <ScenarioHeader card={card} />
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">Контекст</p>
              <p className="mt-2 leading-relaxed">{card.context}</p>
            </div>
            <p className="text-center font-display text-xl italic">Выбери, с какой силой ты готова встретиться</p>
            <div className="space-y-3">
              {(Object.keys(LEVEL_META) as LevelKey[]).map((k) => {
                const m = LEVEL_META[k];
                const on = level === k;
                return (
                  <div key={k} className={`overflow-hidden rounded-2xl border bg-card transition ${on ? "border-gold shadow-glow" : "border-border"}`}>
                    <button onClick={() => setLevel(k)} className="flex w-full items-center gap-4 p-4 text-left">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl ${m.bg}`}>{m.icon}</span>
                      <span>
                        <span className={`block text-xs font-bold uppercase tracking-widest ${m.text}`}>{m.label}</span>
                        <span className="font-display text-xl font-semibold">{card.levels[k].title}</span>
                      </span>
                    </button>
                    {on && <p className="animate-rise px-5 pb-5 leading-relaxed text-muted-foreground">{card.levels[k].text}</p>}
                  </div>
                );
              })}
            </div>
            {level && <Btn onClick={() => setStep("questions")}>Войти в эту ситуацию</Btn>}
            <p className="text-center text-xs text-muted-foreground">Ты всегда можешь выбрать мягче. Это твой выбор.</p>
          </div>
        )}

        {step === "questions" && card && level && (
          <div className="space-y-8 animate-rise">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className={`text-xs font-bold uppercase tracking-widest ${LEVEL_META[level].text}`}>{LEVEL_META[level].label} · {card.levels[level].title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.levels[level].text}</p>
            </div>
            <section className="space-y-3">
              <p className="font-semibold">{hi}что ты чувствуешь, проживая сценарий на карте?</p>
              <Chips items={FEELINGS} value={feelings} onChange={setFeelings} />
              <p className="pt-2 text-sm text-muted-foreground">Где в теле отклик?</p>
              <Chips items={BODY} value={body} onChange={setBody} />
            </section>
            <Btn onClick={() => setStep("dialogue")}>Попробовать диалог с ИИ</Btn>
          </div>
        )}

        {step === 'dialogue' && card && level && (
          <div className="space-y-6 animate-rise">
            <ScenarioHeader card={card} />
            <div className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-muted-foreground">
              <p>{card.context}</p>
              <p className="mt-3">{card.levels[level].text}</p>
            </div>
            {card.id && <IntroTrainer key={`${card.id}-${level}`} cardId={card.id} level={level} initialMessages={trainerMessages} initialSummary={aiSummary} onComplete={(turns, summary) => { setDialogue(turns); setAiSummary(summary); finishDay(turns, summary); }} />}
            <Btn variant="ghost" onClick={() => setStep('questions')}>Вернуться к чувствам</Btn>
          </div>
        )}

        {step === "cta" && (
          <div className="space-y-6 animate-rise">
            <img src={cardsPhoto.url} alt="Карты игры Раппорт ЖиваЯ" className="h-64 w-full rounded-2xl object-cover gold-frame shadow-card" />
            <h2 className="text-4xl font-semibold leading-tight">{hi ? `${name.trim()}, я вижу твой выбор.` : "Я вижу твой выбор."}<span className="block italic text-muted-foreground">Хочешь продолжить вживую?</span></h2>
            <div className="space-y-3">
              <Btn disabled>Записаться на живую игру</Btn>
              <Btn variant="night" disabled>Записаться на онлайн-игру</Btn>
              <Btn variant="ghost" disabled>Интенсив «Я живая — Раппорт с собой»</Btn>
              <Btn onClick={() => navigate({ to: "/season" })}>Челлендж · 7 дней с собой</Btn>
            </div>
            <p className="text-sm text-muted-foreground">Запись откроется, когда появится контакт организатора.</p>
            <Btn variant="ghost" onClick={draw}>Вытянуть ещё карту</Btn>
          </div>
        )}
      </div>
    </main>
  );
}
