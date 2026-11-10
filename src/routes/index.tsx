import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import box from "@/assets/rapport_box.webp.asset.json";
import cardsPhoto from "@/assets/rapport_cards.webp.asset.json";
import { Btn, Logo, Stop } from "@/components/game-ui";
import { hasIntroCompleted, loadSeason, saveSeasonDay, saveSeasonName } from "@/lib/season-store";
import { hasPreviousChallenge, loadChallenge } from "@/lib/challenge-store";
import { ChallengeDay } from "@/components/challenge-day";
import { clearIntroChoices, drawIntroChoices, loadIntroChoices, saveIntroChoices, type IntroChoices } from "@/lib/intro-choices";
import { PLAYABLE_CARDS } from "@/lib/official-cards";
import { IntroVideo } from "@/components/intro-video";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Раппорт: ЖиваЯ — вытяни свою карту" },
      {
        name: "description",
        content:
          "Вытяни случайную карту, выбери один из четырёх ответов и найди свой ресурс. Ближе к себе, ближе к другим.",
      },
      { property: "og:title", content: "Раппорт: ЖиваЯ — вытяни свою карту" },
      { property: "og:description", content: "Случайная тема, четыре ответа и бережное знакомство с собой через карты игры." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step = "intro" | "card" | "cta";

function Index() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [showVideo, setShowVideo] = useState(true);
  const [assignment, setAssignment] = useState<IntroChoices | null>(null);
  const [name, setName] = useState("");
  const [canReturnToChallenge, setCanReturnToChallenge] = useState(false);
  const card = PLAYABLE_CARDS.find(item => item.id === assignment?.cardId);
  const hi = name.trim() ? `${name.trim()}, ` : "";

  useEffect(() => {
    const season = loadSeason();
    setName(season.name);
    setCanReturnToChallenge(hasIntroCompleted(season) || Boolean(loadChallenge().startedAt) || hasPreviousChallenge());
    const saved = loadIntroChoices();
    if (saved) { setAssignment(saved); setStep("card"); }
  }, []);

  const reset = () => {
    clearIntroChoices();
    setAssignment(null);
    setStep("intro");
  };
  const draw = () => {
    saveSeasonName(name.trim());
    const next = drawIntroChoices();
    if (!next) return;
    saveIntroChoices(next);
    setAssignment(next);
    setStep("card");
    window.scrollTo(0, 0);
  };

  if (showVideo) {
    return <IntroVideo onContinue={() => { setShowVideo(false); window.scrollTo(0, 0); }} />;
  }

  if (step === "intro") {
    return (
      <main className="min-h-screen bg-night-gradient text-night-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
          <div className="flex flex-col items-center text-center animate-rise">
            <Logo className="h-16 w-16 text-4xl" />
            <h1 className="mt-5 text-5xl font-semibold leading-none text-gold-gradient">Раппорт</h1>
            <p className="mt-1 font-display text-3xl italic text-gold-soft">— ЖиваЯ —</p>
            <p className="mt-4 text-sm uppercase tracking-[0.3em] text-gold-soft/80">
              ближе к себе · ближе к другим
            </p>
          </div>
          <img
            src={box.url}
            alt="Коробка игры Раппорт ЖиваЯ"
            className="mt-8 rounded-2xl gold-frame shadow-card animate-rise"
          />
          <div className="mt-8 space-y-3 rounded-2xl border border-gold/30 bg-night/40 p-6 text-[15px] leading-relaxed animate-rise">
            <p>✦ Ты играешь роль, а не себя.</p>
            <p>✦ Здесь нет правильных ответов.</p>
            <p>
              ✦ Если страшно — нажми <b className="text-gold">СТОП</b>. Без объяснений.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <label className="block text-center font-display text-xl italic text-gold-soft">
              Как к тебе можно обращаться?
            </label>
            <input
              aria-label="Твоё имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Твоё имя"
              className="w-full rounded-full border border-gold/50 bg-night/40 px-6 py-4 text-center text-lg outline-none placeholder:text-night-foreground/40 focus:border-gold"
            />
            {name.trim() && <Btn onClick={draw}>Вытянуть карту</Btn>}
            {canReturnToChallenge && <Btn variant="night" onClick={() => navigate({ to: "/season" })}>Продолжить челлендж · 7 дней с собой</Btn>}
          </div>
          <p className="mt-4 text-center text-xs text-night-foreground/60">
            Это игра-зеркало, а не психотерапия.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="challenge-theme min-h-screen bg-night-gradient text-foreground">
      <Stop onStop={reset} />
      <div className="mx-auto max-w-md px-6 pb-16 pt-20">
        {step === "card" && card && assignment && <ChallengeDay
          key={assignment.cardId + assignment.theme}
          introductory
          day={1}
          card={card}
          theme={assignment.theme}
          draft={assignment.draft}
          onDraft={draft => {
            const next = {...assignment, draft};
            saveIntroChoices(next);
            setAssignment(next);
          }}
          onComplete={entry => {
            saveSeasonName(name.trim());
            saveSeasonDay(entry);
            clearIntroChoices();
            setStep("cta");
            window.scrollTo(0, 0);
          }}
        />}

        {step === "cta" && (
          <div className="space-y-6 animate-rise">
            <img
              src={cardsPhoto.url}
              alt="Карты игры Раппорт ЖиваЯ"
              className="h-64 w-full rounded-2xl object-cover gold-frame shadow-card"
            />
            <h2 className="text-4xl font-semibold leading-tight">
              {hi ? `${name.trim()}, я вижу твой выбор.` : "Я вижу твой выбор."}
              <span className="block italic text-muted-foreground">Хочешь продолжить вживую?</span>
            </h2>
            <div className="space-y-3">
              <Btn disabled>Записаться на живую игру</Btn>
              <Btn variant="night" disabled>
                Записаться на онлайн-игру
              </Btn>
              <Btn variant="ghost" disabled>
                Интенсив «Я живая — Раппорт с собой»
              </Btn>
              <Btn onClick={() => navigate({ to: "/season" })}>Челлендж · 7 дней с собой</Btn>
            </div>
            <p className="text-sm text-muted-foreground">
              Запись откроется, когда появится контакт организатора.
            </p>
            <Btn variant="ghost" onClick={draw}>
              Вытянуть ещё карту
            </Btn>
          </div>
        )}
      </div>
    </main>
  );
}
