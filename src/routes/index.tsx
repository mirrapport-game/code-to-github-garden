import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import box from "@/assets/rapport_box.webp.asset.json";
import cardsPhoto from "@/assets/rapport_cards.webp.asset.json";
import { Btn, Logo, Stop } from "@/components/game-ui";
import { loadSeason, writeSeason } from "@/lib/season-store";
import { assignPractice, practiceStatus } from '@/lib/daily-practice';
import { IntroDayJourney } from "@/components/intro-day-journey";
import { clearIntroChoices, loadIntroChoices, saveIntroChoices, type IntroChoices } from "@/lib/intro-choices";
import { PLAYABLE_CARDS } from "@/lib/official-cards";
import { IntroVideo } from "@/components/intro-video";
import { ComingSoonButton } from '@/components/coming-soon-button';
import { supabase } from '@/integrations/supabase/client';
import { useParticipant } from '@/components/participant-provider';
import { ChallengeRequestEditor } from '@/components/challenge-request';
import { requestReady, activeRequest, type ChallengeRequest } from '@/lib/challenge-request';
import { BookingActions } from '@/components/booking-actions';


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Раппорт: ЖиваЯ — вытяни свою карту" },
      {
        name: "description",
        content:
          "Вводный день Раппорт: ЖиваЯ: карта, чувства персонажа, работа с установкой, новый диалог с ИИ и резюме «Было — Стало».",
      },
      { property: "og:title", content: "Раппорт: ЖиваЯ — вытяни свою карту" },
      { property: "og:description", content: "Одна новая карта в день: чувства персонажа, работа с установкой, диалог и личная статистика." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Step = "intro" | "request" | "requestEditor" | "card" | "cta";

function Index() {
  const {user,profile} = useParticipant();
  const [season, setSeason] = useState<ReturnType<typeof loadSeason>>({name: '', days: {}});
  const status = practiceStatus(season);
  const [step, setStep] = useState<Step>("intro");
  const [showVideo, setShowVideo] = useState(true);
  const [assignment, setAssignment] = useState<IntroChoices | null>(null);
  const [name, setName] = useState("");
  const card = PLAYABLE_CARDS.find(item => item.id === assignment?.cardId);
  const hi = name.trim() ? `${name.trim()}, ` : "";
  const [requestDraft, setRequestDraft] = useState<ChallengeRequest>({mode:'with',method:'situation',text:'',confirmed:false});
  const saveRequest = (request: ChallengeRequest) => {
    const saved = loadSeason();
    const value = {...saved, dailyPractice: {...saved.dailyPractice, startedAt: saved.dailyPractice?.startedAt ?? saved.days[1]?.doneAt ?? new Date().toISOString(), assignments: saved.dailyPractice?.assignments ?? {}, request}};
    writeSeason(value); setSeason(value);
  };

  useEffect(() => {
    const restore=()=>{
    const season = loadSeason();
    setSeason(season); setName(season.name);
    const saved = loadIntroChoices();
    if (saved && practiceStatus(season).unlocked) { setAssignment(saved); setStep("card"); }
    };
    restore();window.addEventListener('rapport-account-ready',restore);
    const timer = setInterval(() => setSeason(loadSeason()), 30000);
    return ()=>{clearInterval(timer);window.removeEventListener('rapport-account-ready',restore);};
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const restoreSession = async () => {
      const {data, error} = await supabase.from('intro_day_sessions').select('card_id').eq('user_id', user.id).is('completed_at', null).order('created_at', {ascending: false}).limit(1).maybeSingle();
      if (!active || error || !data || !practiceStatus(loadSeason()).unlocked || !PLAYABLE_CARDS.some(card => card.id === data.card_id)) return;
      const next: IntroChoices = {cardId: data.card_id, theme: 'Вводный день', draft: {}};
      setAssignment(next); setStep('card');
    };
    void restoreSession();
    window.addEventListener('rapport-account-ready', restoreSession);
    return () => {active = false; window.removeEventListener('rapport-account-ready', restoreSession);};
  }, [user?.id]);

  const reset = () => {
    setStep("intro");
  };
  const draw = () => {
    if (!requestReady(loadSeason().dailyPractice?.request)) {setStep('request'); return;}
    const assigned = assignPractice(loadSeason(), PLAYABLE_CARDS.flatMap(card => card.id ? [card.id] : []));
    const state = practiceStatus(assigned);
    if (!state.unlocked) return;
    const cardId = assigned.dailyPractice?.assignments[state.day];
    if (!cardId) return;
    writeSeason(assigned); setSeason(assigned);
    const next: IntroChoices = {cardId, theme: `День ${state.day}`, draft: {}};
    saveIntroChoices(next);
    setAssignment(next);
    setStep("card");
    window.scrollTo(0, 0);
  };

  if (showVideo) {
    return <IntroVideo onContinue={() => { setShowVideo(false); window.scrollTo(0, 0); }} />;
  }
  if (step === 'request' || step === 'requestEditor') return <main className="challenge-theme min-h-svh bg-night-gradient text-foreground"><div className="mx-auto max-w-md space-y-6 px-6 pb-28 pt-10">{step === 'request' ? <><h1 className="text-4xl font-semibold">Как ты хочешь играть?</h1><Btn onClick={() => setStep('requestEditor')}>Сформулировать запрос</Btn><Btn variant="night" onClick={() => {saveRequest({mode:'without',method:'situation',text:'',confirmed:true});draw();}}>Без запроса</Btn><Btn variant="ghost" onClick={() => setStep('intro')}>Назад</Btn></> : <ChallengeRequestEditor value={requestDraft} onChange={setRequestDraft} onBack={() => setStep('request')} onContinue={() => {saveRequest({...requestDraft,confirmed:true});draw();}}/>}</div></main>;

  if (step === "intro") {
    return (
      <main className="min-h-screen bg-night-gradient text-night-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-28 pt-10">
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
          <div className="mt-8 space-y-3 text-[15px] leading-relaxed animate-rise">
            {status.day>1&&status.day<=7?<><p className="text-xl text-gold">{profile?.display_name||name||'Участница'}, рада видеть тебя снова!</p><p>В прошлый раз ты сыграла ситуацию «{PLAYABLE_CARDS.find(card=>card.id===season.days[status.day-1]?.cardId)?.scenario??season.days[status.day-1]?.stage}».</p>{season.days[status.day-1]?.aiSummary&&<p className="whitespace-pre-wrap border-l-2 border-gold pl-4">{season.days[status.day-1]?.aiSummary}</p>}<p>Сегодня попробуем новый сценарий и другой разговор. Что из прошлого дня ты хочешь взять с собой?</p></>:<p>Представь, что ты на игре. Ты играешь персонажа, и твой персонаж попадает в случайную ситуацию.</p>}
            <p>Сейчас ты вытянешь карточку и выберешь степень сложности ситуации, в которой нужно найти взаимопонимание с партнёром — Раппóрт, даже если поначалу твоего персонажа захватывают эмоции.</p>
            <p>✦ Ты играешь роль, а не себя.</p>
            <p>✦ Здесь нет правильных ответов.</p>
            <p>
              ✦ Если страшно — нажми <b className="text-gold">СТОП</b>. Без объяснений.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <p className="text-center text-gold">Пройдено {status.completed.length} из 7 дней</p>
            {!status.finished && <Btn disabled={!status.unlocked} onClick={draw}>День {status.day}</Btn>}
            {status.finished ? <p className="text-center text-gold">Семь дней завершены</p> : !status.unlocked && <p className="text-center text-sm text-muted-foreground">Новая карта откроется завтра</p>}
            <ComingSoonButton hint="Модуль в разработке">Программы</ComingSoonButton>
            <BookingActions/>
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
      <div className="mx-auto max-w-md px-6 pb-28 pt-20">
        {step === "card" && card && assignment && <IntroDayJourney
          key={assignment.cardId + assignment.theme}
          card={card}
          dayNumber={status.day}
          withoutShadow
          requestText={activeRequest(season.dailyPractice?.request)}
          onComplete={() => {
            clearIntroChoices();
            setAssignment(null);
            setSeason(loadSeason());
            setStep("intro");
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
              <ComingSoonButton hint="Модуль в разработке">Программы</ComingSoonButton>
            </div>
            <p className="text-sm text-muted-foreground">
              Запись откроется, когда появится контакт организатора.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
