import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Btn, Logo, Stop } from '@/components/game-ui';
import { SelfTest, TestProfile } from '@/components/self-test';
import { ChallengeDay } from '@/components/challenge-day';
import { DEMO_CARDS, DEMO_THEMES } from '@/lib/demo-cards';
import { PRACTICES, canOpenDay, unlockAt, challengeComplete } from '@/lib/challenge';
import { assignDay, clearChallenge, loadChallenge, saveChallenge, type ChallengeState, type Feedback } from '@/lib/challenge-store';
import { scoreTest, suggestedLevel } from '@/lib/self-test';
import { hasIntroCompleted, loadSeason } from '@/lib/season-store';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/season')({
  head: () => ({ meta: [
    { title: '7 дней с собой — Раппорт: ЖиваЯ' },
    { name: 'description', content: 'Семидневный челлендж: случайные карты, Тень, проекция, интроекция и новые способы ответа. Тест до и после.' },
    { property: 'og:title', content: '7 дней с собой — Раппорт: ЖиваЯ' },
    { property: 'og:description', content: 'Семь встреч с собой через карты игры и бережные практики.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Season,
});

type Screen = 'overview' | 'before' | 'after' | 'profile' | 'day' | 'feedback';
const initialFeedback: Feedback = { takeaway:'', character:'', useful:'', difficult:'', change:'', format:'', rating:0 };
function Season() {
  const navigate = useNavigate();
  const [state, setState] = useState<ChallengeState | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [screen, setScreen] = useState<Screen>('overview');
  const [activeDay, setActiveDay] = useState(1);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState('');
  const [resetPrompt, setResetPrompt] = useState(false);
  useEffect(() => {
    const saved = loadChallenge();
    const intro = loadSeason();
    setIntroDone(hasIntroCompleted(intro) || Boolean(saved.baseline));
    setState({...saved, name: saved.name || intro.name});
    const id = setInterval(() => setNow(new Date()),30000);
    return () => clearInterval(id);
  },[]);
  const persist = (next: ChallengeState) => {
    try {saveChallenge(next); setState(next); setError(''); return true;}
    catch {setError('Не удалось сохранить ответы в этом браузере. Разреши хранение данных или освободи место и попробуй снова.'); return false;}
  };
  const go = (next: Screen) => {setScreen(next); window.scrollTo(0,0);};
  if (!state) return <main className="min-h-screen bg-background" />;
  if (!introDone) return <main className="min-h-screen bg-night-gradient text-night-foreground"><div className="mx-auto max-w-md space-y-6 px-6 py-16"><Logo className="h-16 w-16 text-4xl" /><h1 className="text-4xl font-semibold">Сначала — знакомство с собой</h1><Btn onClick={() => navigate({to: '/'})}>К первой карте</Btn></div></main>;
  const completed = challengeComplete(state);
  const passed = Object.keys(state.days).length;
  const feedback = state.feedback ?? initialFeedback;
  const card = DEMO_CARDS.find(c => c.stage === state.assignments[activeDay]);
  const open = (day: number) => {
    if (!canOpenDay(state,day)) return;
    if (persist(assignDay(state,day))) {setActiveDay(day); go('day');}
  };
  const updateFeedback = (values: Partial<Feedback>) => persist({...state, feedback: {...feedback,...values}});
  return <main className="min-h-screen bg-background">
    <Stop onStop={() => go('overview')} />
    <div className="mx-auto max-w-lg px-5 pb-16 pt-20">
      {error && <p role="alert" className="mb-5 rounded-lg border border-destructive p-4 text-destructive">{error}</p>}
      {screen === 'overview' && <div className="space-y-8">
        <header className="border-b border-border pb-7">
          <div className="flex items-center gap-4"><Logo className="h-12 w-12 text-2xl" /><p className="text-sm text-muted-foreground">Раппорт: ЖиваЯ</p></div>
          <h1 className="mt-5 text-5xl font-semibold">7 дней с собой</h1>
          <p className="mt-3 font-display text-2xl italic">{state.name ? `${state.name}, ближе к себе — день за днём.` : 'Ближе к себе — день за днём.'}</p>
          <p className="mt-4 text-sm text-muted-foreground">{passed} из 7 дней пройдено</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gold-gradient" style={{width:`${passed/7*100}%`}} /></div>
        </header>
        {!state.baseline && <section className="space-y-4">
          <label className="block font-semibold">Как к тебе обращаться?<input aria-label="Твоё имя" value={state.name} onChange={e => persist({...state,name:e.target.value})} placeholder="Твоё имя" className="mt-2 w-full rounded-lg border border-input bg-card px-4 py-3 outline-none focus:border-gold" /></label>
          <Btn disabled={!state.name.trim()} onClick={() => go('before')}>Пройти входной тест</Btn>
          <p className="text-sm text-muted-foreground">Ты играешь роль, а не себя. Нет правильных ответов. Можно остановиться без объяснений. Это игра-зеркало, не психотерапия.</p>
        </section>}
        {state.baseline && <Btn variant="ghost" onClick={() => go('profile')}>Мой профиль {state.finalTest ? 'до / после' : 'до начала'}</Btn>}
        <ol className="space-y-4">{PRACTICES.map((p,i) => {
          const day = i+1; const entry = state.days[day]; const available = canOpenDay(state,day,now); const date = unlockAt(state,day);
          return <li key={day} className={`rounded-lg border bg-card p-5 ${entry || available ? 'border-gold' : 'border-border'}`}>
            <div className="flex items-center justify-between gap-3"><span className="text-xs uppercase text-gold">День {day}</span><span className="text-xs text-muted-foreground">{entry ? 'Пройдено' : available ? 'Доступен' : 'Закрыт'}</span></div>
            <h2 className="mt-2 text-2xl font-semibold">{p.title}</h2>
            {entry ? <details className="mt-3"><summary className="cursor-pointer text-sm text-muted-foreground">{entry.stage} · Твои ответы</summary><div className="mt-4 space-y-4 text-sm">
              <p>{entry.feelings.join(', ')}{entry.body.length ? ` · ${entry.body.join(', ')}` : ''}</p>
              {[["Что задело",entry.hurt], ...(day > 1 ? [["Тень",entry.shadow]] : []), ["Ресурс",entry.resource], ...p.questions.map((q,index) => [q,entry.practice[index] ?? ''])].map(([title,value]) => <div key={title}><p className="font-semibold">{title}</p><p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">{value}</p></div>)}
            </div></details> : available ? <Btn className="mt-4" onClick={() => open(day)}>{state.assignments[day] ? 'Продолжить карту' : 'Вытянуть карту'}</Btn> : <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{!state.baseline ? 'После входного теста' : date && now < date ? `Откроется ${date.toLocaleDateString('ru-RU')} по времени этого устройства, после предыдущего дня.` : 'Сначала заверши предыдущий день.'}</p>}
          </li>;
        })}</ol>
        {completed && !state.finalTest && <Btn onClick={() => go('after')}>Повторить тест — что изменилось?</Btn>}
        {completed && state.finalTest && <Btn onClick={() => go('feedback')}>Обратная связь и следующий шаг</Btn>}
        <Link to="/" className="block text-center text-sm text-muted-foreground underline underline-offset-4">Раппорт: ЖиваЯ</Link>
        {state.baseline && <Btn variant="ghost" onClick={() => setResetPrompt(true)}>Начать челлендж заново</Btn>}
        <p className="text-xs text-muted-foreground">Ответы хранятся только в этом браузере, не отправляются организатору и не доступны с другого устройства. Новый день открывается в полночь по местному времени; пропущенные дни можно пройти позже.</p>
      </div>}
      {(screen === 'before' || screen === 'after') && <SelfTest key={screen} repeated={screen === 'after'} initial={state.testDrafts[screen]} onDraft={answers => persist({...state,testDrafts:{...state.testDrafts,[screen]:answers}})} onComplete={answers => {
        const next = screen === 'before' ? {...state,baseline:answers, startedAt:state.startedAt ?? new Date().toISOString()} : {...state,finalTest:answers};
        if (persist(next)) go('profile');
      }} />}
      {screen === 'profile' && state.baseline && <div className="space-y-8">
        <TestProfile before={state.baseline} after={state.finalTest} />
        {!state.finalTest && <p className="text-sm text-muted-foreground">Можно присмотреться к темам: {scoreTest(state.baseline).sort((a,b) => a.value-b.value)[0]?.themes.join(', ')}. Ежедневная карта всё равно выбирается случайно.</p>}
        {state.finalTest && <section className="border-t border-border pt-6"><h2 className="text-2xl font-semibold">Дневник эмоций</h2><p className="mt-2 text-xs text-muted-foreground">Количество отмеченных чувств, не сила переживаний.</p><div className="mt-4 flex h-40 items-end gap-2">{Array.from({length:7},(_,i) => {const count = state.days[i+1]?.feelings.length ?? 0; return <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="text-xs">{count}</span><div className="w-full rounded-t bg-level-soft" style={{height:`${count / 12 * 90}px`}} /><span className="text-xs">{i+1}</span></div>;})}</div></section>}
        <Btn onClick={() => go(state.finalTest ? 'feedback' : 'overview')}>{state.finalTest ? 'Что ты забираешь с собой?' : 'К первой карте'}</Btn>
      </div>}
      {screen === 'day' && card && state.baseline && canOpenDay(state,activeDay,now) && <ChallengeDay key={activeDay} day={activeDay} card={card} name={state.name} suggested={suggestedLevel(state.baseline)} draft={state.drafts[activeDay]} onDraft={draft => persist({...state,drafts:{...state.drafts,[activeDay]:draft}})} onComplete={entry => {
        if (!canOpenDay(state,activeDay)) return;
        if (persist({...state,days:{...state.days,[activeDay]:entry}})) go('overview');
      }} />}
      {screen === 'feedback' && completed && state.finalTest && <div className="space-y-6">
        <p className="text-sm uppercase text-gold">Семь дней пройдены</p><h1 className="text-4xl font-semibold">Что ты забираешь с собой?</h1>
        {([['takeaway','Что ты забираешь из челленджа?'],['useful','Что было полезным?'],['difficult','Что было сложно или не подошло?'],['change','Что стоит изменить в игре?']] as const).map(([key,label]) => <label key={key} className="block space-y-2 font-semibold">{label}<textarea aria-label={label} value={feedback[key]} onChange={e => updateFeedback({[key]:e.target.value})} className="min-h-24 w-full rounded-lg border border-input bg-card p-4 font-normal outline-none focus:border-gold" /></label>)}
        <label className="block space-y-2 font-semibold">С каким персонажем хочешь играть дальше?<select aria-label="Персонаж" value={feedback.character} onChange={e => updateFeedback({character:e.target.value})} className="w-full rounded-lg border border-input bg-card p-3 font-normal"><option value="">Выбери тему</option>{DEMO_THEMES.map(t => <option key={t}>{t}</option>)}</select></label>
        <fieldset><legend className="mb-3 font-semibold">Насколько тебе подошёл челлендж?</legend><div className="flex gap-2">{[1,2,3,4,5].map(v => <Btn key={v} variant={feedback.rating === v ? 'night' : 'ghost'} onClick={() => updateFeedback({rating:v})}>{v}</Btn>)}</div><p className="mt-2 text-xs text-muted-foreground">1 — совсем не подошёл · 5 — очень подошёл</p></fieldset>
        <fieldset><legend className="mb-3 font-semibold">Как хочешь продолжить?</legend><div className="space-y-2">{['Онлайн-игра','Живая игра','Пока не решила'].map(format => <Btn key={format} variant={feedback.format === format ? 'night' : 'ghost'} onClick={() => updateFeedback({format})}>{format}</Btn>)}</div></fieldset>
        <p className="font-display text-2xl italic">В следующей игре можно встретиться с другими участницами — онлайн или вживую.</p>
        <p className="text-sm text-muted-foreground">Выбор сохранён в этом браузере. Запись пока не открыта — ждём контакты организатора.</p>
        <Btn variant="ghost" onClick={() => {
          const text = ['Раппорт: ЖиваЯ — обратная связь', ...Object.entries(feedback).map(([k,v]) => `${({takeaway:'Что забираю',character:'Персонаж',useful:'Полезное',difficult:'Сложное',change:'Что изменить',format:'Формат',rating:'Отклик'} as Record<string,string>)[k]}: ${v}`)].join('\n\n');
          const url = URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href=url; a.download='rapport-feedback.txt'; a.click(); URL.revokeObjectURL(url);
        }}>Скачать мою обратную связь</Btn>
        <Btn onClick={() => go('overview')}>Вернуться к своим семи дням</Btn>
      </div>}
      {screen !== 'overview' && <Btn className="mt-8" variant="ghost" onClick={() => go('overview')}>К моим дням</Btn>}
    </div>
    {resetPrompt && <div className="fixed inset-0 z-50 grid place-items-center bg-night/70 p-5"><section className="w-full max-w-sm rounded-lg bg-card p-6"><h2 className="text-3xl">Начать заново?</h2><p className="my-4 text-sm">Все ответы, тесты и карты этого челленджа будут удалены из браузера.</p><div className="space-y-3"><Btn onClick={() => {clearChallenge(); setState(loadChallenge()); setResetPrompt(false); go('overview');}}>Удалить и начать заново</Btn><Btn variant="ghost" onClick={() => setResetPrompt(false)}>Сохранить мои ответы</Btn></div></section></div>}
  </main>;
}
