import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useParticipant } from '@/components/participant-provider';
import { Btn } from '@/components/game-ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DAY_FEELINGS, SETUP_QUESTIONS, dayContext, dialogueComplete, newIntroDay, partnerLine, persistableDay, setupComplete, toggleDayFeeling, toggleDayQuality, type IntroDay } from '@/lib/intro-day';
import { textOnlyMessages } from '@/lib/intro-trainer';
import type { GameCard, LevelKey } from '@/lib/cards';
import { saveSeasonDay, loadSeason, writeSeason } from '@/lib/season-store';
import { EmotionRelease } from '@/components/emotion-release';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookingActions } from '@/components/booking-actions';
import { INTRO_QUALITIES, INTRO_SELF_QUALITIES } from '@/lib/intro-choices';
import { integrationProfile } from '@/lib/intro-integration';

export function IntroDayJourney({card, onComplete, dayNumber = 1, withoutShadow = false, requestText}: {card: GameCard; onComplete: () => void; dayNumber?: number; withoutShadow?: boolean; requestText?: string | undefined}) {
  const {user, loading} = useParticipant();
  if (loading) return <p role="status">Загружаем вводный день…</p>;
  return <Journey key={`${user?.id ?? 'guest'}:${card.id}`} card={card} userId={user?.id} onComplete={onComplete} dayNumber={dayNumber} withoutShadow={withoutShadow} requestText={requestText} />;
}

function Journey({card, userId, onComplete, dayNumber, withoutShadow, requestText}: {card: GameCard; userId?: string | undefined; onComplete: () => void; dayNumber: number; withoutShadow: boolean; requestText?: string | undefined}) {
  const {flush} = useParticipant();
  const [day, setDay] = useState<IntroDay>(() => newIntroDay(card.id ?? ''));
  const current = useRef(day);
  const [ready, setReady] = useState(false), [failure, setFailure] = useState(''), [saving, setSaving] = useState(false);
  const [chatOpen, setChatOpen] = useState(false), [skillOpen, setSkillOpen] = useState(false);
  const queue = useRef<Promise<boolean>>(Promise.resolve(true));
  const key = `rapport-intro-day-v1:${userId ?? 'guest'}:${card.id}`;
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        let restored: IntroDay | null = null;
        const local = window.localStorage.getItem(key);
        if (local) restored = JSON.parse(local) as IntroDay;
        if (userId) {
          const result = await supabase.from('intro_day_sessions').select('*').eq('user_id', userId).eq('card_id', card.id ?? '').order('created_at', {ascending: false}).limit(1).maybeSingle();
          if (result.error) throw result.error;
          if (result.data) restored = result.data as unknown as IntroDay;
        }
        if (!active) return;
        if (restored) {const value = persistableDay(restored); if (withoutShadow && value.reflection_stage === 'shadow') value.reflection_stage = 'qualities'; current.current = value; setDay(value);}
        setReady(true);
      } catch {if (active) setFailure('Не удалось загрузить вводный день. Обнови страницу, чтобы не потерять сохранённые ответы.');}
    })();
    return () => {active = false;};
  }, [key, userId, card.id]);
  const store = (value: IntroDay) => {
    const safe = persistableDay(value);
    try {window.localStorage.setItem(key, JSON.stringify(safe));} catch {setFailure('Не удалось сохранить ответы в браузере.');}
    if (!userId) return Promise.resolve(true);
    queue.current = queue.current.catch(() => false).then(async () => {
      const result = await supabase.from('intro_day_sessions').upsert({...safe, user_id: userId, setup_answers: safe.setup_answers as Json, dialogue: safe.dialogue as unknown as Json, skill_dialogue: safe.skill_dialogue as unknown as Json, request_reflection: safe.request_reflection as Json, updated_at: new Date().toISOString()}, {onConflict: 'id'});
      if (result.error) {setFailure('Не удалось сохранить вводный день в аккаунте. Попробуй ещё раз.'); return false;}
      setFailure(''); return true;
    });
    return queue.current;
  };
  const update = (patch: Partial<IntroDay>) => {
    const next = {...current.current, ...patch}; current.current = next; setDay(next); void store(next); return next;
  };
  const next = async (step: number) => {
    setSaving(true);
    const value = {...current.current, step};
    if (await store(value)) {current.current = value; setDay(value); window.scrollTo(0, 0);}
    setSaving(false);
  };
  const finish = async () => {
    if (saving || !current.current.summary_text.trim()) return;
    setSaving(true);
    const value = {...current.current, completed_at: current.current.completed_at ?? new Date().toISOString()};
    if (!await store(value)) {setSaving(false); return;}
    saveSeasonDay({day: dayNumber, cardId: card.id, stage: card.stage, level: value.partner_harshness ?? 'soft', feelings: value.chosen_feelings, body: [], hurt: '', shadow: '', resource: '', dialogue: [...value.dialogue,...value.skill_dialogue].map(item => ({role: item.role === 'user' ? 'participant' : 'other', text: item.parts.filter(part => part.type === 'text').map(part => part.text).join('\n')})), aiSummary: value.summary_text, doneAt: value.completed_at, ...(requestText ? {requestReflection:{...value.request_reflection,requestText}} : {})});
    if (userId && !await flush()) {setFailure('Вводный день сохранён; не удалось обновить общий прогресс. Нажми завершение ещё раз.'); setSaving(false); return;}
    onComplete();
  };
  if (!ready) return <p role={failure ? 'alert' : 'status'}>{failure || 'Загружаем вводный день…'}</p>;
  const quote = <aside aria-label="Реплика партнёра" className="sticky top-14 z-20 max-h-[35svh] overflow-y-auto rounded-lg border border-gold/60 bg-card p-4 shadow-card"><h2 className="text-xl font-semibold text-gold">Партнёр говорит:</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{day.partner_line}</p></aside>;
  return <section className="flex min-h-[70svh] flex-col gap-6">
    <p className="text-xs text-muted-foreground">День {dayNumber} · {day.step} / 7</p>
    {day.step > 1 && day.step !== 4 && quote}
    {day.step === 1 && <>
      <p className="leading-relaxed">Представь, что ты на игре. Ты играешь персонажа, и эта случайная карточка — его ситуация. Выбери её степень сложности. Цель — найти взаимопонимание с партнёром (Раппóрт), даже если поначалу персонажа захватывают эмоции.</p>
      <img src={card.cover} alt={card.stage} className="mx-auto max-h-80 w-full rounded-lg object-contain" />
      <h1 className="text-3xl font-semibold">{card.scenario}</h1><p className="leading-relaxed">{card.context}</p>
      <div className="grid grid-cols-3 gap-2">{([['soft', 'Мягко', 'bg-level-soft'], ['medium', 'Средне', 'bg-level-medium'], ['hard', 'Жестко', 'bg-level-hard']] as const).map(([level, label, color]) => <Button key={level} variant="ghost" aria-pressed={day.partner_harshness === level} className={`h-14 border-2 text-level-foreground hover:brightness-110 ${color} ${day.partner_harshness === level ? 'border-gold ring-2 ring-gold ring-offset-2 ring-offset-background' : 'border-transparent'}`} onClick={() => update({partner_harshness: level, partner_line: partnerLine(card.levels[level].text)})}>{label}</Button>)}</div>
      <Btn disabled={!day.partner_harshness || saving} onClick={() => void next(2)}>Дальше</Btn>
    </>}
    {day.step === 2 && <Btn disabled={saving} onClick={() => void next(3)}>Определить чувства</Btn>}
    {day.step === 3 && day.reflection_stage === 'feelings' && <>
      <h1 className="text-3xl font-semibold">Что чувствует твой персонаж в этой роли, когда с ним вот так разговаривает партнёр?</h1>
      <p className="leading-relaxed">Назвать свои эмоции — уже половина пути, 50% успеха в решении ситуации в нашей игре. Теперь ты знаешь, с чем работаешь.</p>
      <p className="text-sm text-muted-foreground">Выбери до трёх эмоций, которые сейчас сильнее всего.</p>
      <div className="grid grid-cols-2 gap-2">{DAY_FEELINGS.map(feeling => <Button key={feeling} variant="outline" aria-pressed={day.chosen_feelings.includes(feeling)} disabled={day.chosen_feelings.length >= 3 && !day.chosen_feelings.includes(feeling)} className={day.chosen_feelings.includes(feeling) ? 'border-gold bg-primary text-primary-foreground' : 'bg-card'} onClick={() => update({chosen_feelings: toggleDayFeeling(day.chosen_feelings, feeling), feelings_chosen: true})}>{feeling}</Button>)}</div>
      <Btn disabled={!day.chosen_feelings.length || saving} onClick={() => {update({reflection_stage: 'qualities'}); window.scrollTo(0, 0);}}>Определить качества</Btn>
    </>}
    {day.step === 3 && day.reflection_stage === 'qualities' && <>
      <h1 className="text-3xl font-semibold">Какие качества партнёра тебе трудно принять?</h1>
      <p>Отметь, что замечает твой персонаж в этой ситуации. Это его восприятие, а не оценка личности партнёра.</p>
      <div className="grid grid-cols-2 gap-2">{INTRO_QUALITIES.map(quality => <Button key={quality} variant="outline" aria-pressed={day.chosen_qualities.includes(quality)} className={`h-auto min-h-11 whitespace-normal ${day.chosen_qualities.includes(quality) ? 'border-gold bg-primary text-primary-foreground' : 'bg-card'}`} onClick={() => update({chosen_qualities: toggleDayQuality(day.chosen_qualities, quality)})}>{quality}</Button>)}</div>
      <Btn disabled={!day.chosen_qualities.length || saving} onClick={() => {if (withoutShadow) {void next(4); return;} update({reflection_stage: 'shadow'}); window.scrollTo(0, 0);}}>{withoutShadow ? 'Отпустить эмоции' : 'Определить тень'}</Btn>
      <Btn variant="ghost" onClick={() => update({reflection_stage: 'feelings'})}>Назад к чувствам</Btn>
    </>}
    {day.step === 3 && day.reflection_stage === 'shadow' && !withoutShadow && <>
      <h1 className="text-3xl font-semibold">Какой твой персонаж не позволяет себе быть?</h1>
      <p>Тень в игре — качества, которые персонажу трудно себе разрешить. Выбери то, что откликается; можно выбрать «Пока не знаю». Это не диагноз.</p>
      <div className="grid grid-cols-2 gap-2">{INTRO_SELF_QUALITIES.map(quality => <Button key={quality} variant="outline" aria-pressed={day.chosen_shadows.includes(quality)} className={`h-auto min-h-11 whitespace-normal ${day.chosen_shadows.includes(quality) ? 'border-gold bg-primary text-primary-foreground' : 'bg-card'}`} onClick={() => update({chosen_shadows: toggleDayQuality(day.chosen_shadows, quality, true)})}>{quality}</Button>)}</div>
      <p>Не нужно выговаривать накопленное партнёру. Сначала отпусти эмоциональный заряд, а затем скажи о своей потребности и поищи взаимопонимание. Само качество не нужно уничтожать или подавлять.</p>
      <Btn disabled={!day.chosen_shadows.length || saving} onClick={() => void next(4)}>Перейти к выпуску эмоций</Btn>
      <Btn variant="ghost" onClick={() => update({reflection_stage: 'qualities'})}>Назад к качествам</Btn>
    </>}
    {day.step === 4 && <EmotionRelease day={withoutShadow ? {...day, chosen_shadows: []} : day} situation={`${card.scenario}\n${card.context}\n${day.partner_line}`} onMethod={release_method => update({release_method})} onDone={() => void next(5)} disabled={saving} />}
    {day.step === 5 && <>
      <h1 className="text-3xl font-semibold">Работа с установкой</h1><p>Теперь — время поработать с сознанием.</p>
      {SETUP_QUESTIONS.map((question, index) => <label key={question} className="grid gap-3"><span>{question}</span><Textarea aria-label={question} value={day.setup_answers[index] ?? ''} maxLength={12000} onChange={event => {const answers = [...current.current.setup_answers]; answers[index] = event.target.value; update({setup_answers: answers});}} className="min-h-28" /></label>)}
      <Btn disabled={!setupComplete(day.setup_answers) || saving} onClick={() => void next(6)}>Начать новый диалог</Btn>
    </>}
    {day.step === 6 && <>
      <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Начать новый диалог</h1><p>Представь, что ты начинаешь диалог заново. Насколько сейчас сильны твои эмоции?</p>
      <div className="space-y-4"><p className="text-gold">Сила эмоций: {day.emotion_intensity ?? '—'} / 10</p><Slider aria-label="Сила эмоций" min={1} max={10} step={1} value={[day.emotion_intensity ?? 1]} onValueChange={values=>{const value=values[0];if(value!==undefined)update({emotion_intensity:value});}}/><div className="flex justify-between text-sm text-muted-foreground"><span>1 · слабые</span><span>10 · очень сильные</span></div><div className="grid grid-cols-5 gap-2">{Array.from({length:10},(_,i)=>i+1).map(value=><Button key={value} variant={day.emotion_intensity===value?'default':'outline'} aria-pressed={day.emotion_intensity===value} aria-label={`Эмоции ${value} из 10`} onClick={()=>update({emotion_intensity:value})}>{value}</Button>)}</div></div>
      <p>Попробуй ещё раз проиграть диалог: разделить с партнёром его чувства и понять, что он на самом деле хочет тебе сказать.</p>
      <p className="text-gold">Цель — найти Раппóрт и сохранить отношения, не отказываясь от своих границ.</p>
      {!withoutShadow && day.chosen_shadows.map(quality => {const profile = integrationProfile(quality); return profile ? <p key={quality} className="border-l-2 border-gold pl-4"><b>Опора на качество «{profile.name}»:</b> {profile.integrated}</p> : null;})}
      <dl className="space-y-4">{SETUP_QUESTIONS.map((question, index) => <div key={question}><dt className="text-sm text-gold">{question}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{day.setup_answers[index]}</dd></div>)}</dl>
      {!chatOpen && !day.dialogue.length ? <Btn disabled={day.emotion_intensity===null} onClick={() => setChatOpen(true)}>Начать диалог с ИИ</Btn> : <DayChat day={withoutShadow ? {...day, chosen_shadows: []} : day} requestText={requestText} onProgress={value => update(value)} onSummary={() => void next(7)} onApply={skill=>{update({skill_text:skill});setSkillOpen(true);}} />}
      {day.skill_text&&<Btn variant="night" onClick={()=>setSkillOpen(true)}>Продолжить диалог с навыком</Btn>}
      <Dialog open={skillOpen} onOpenChange={setSkillOpen}><DialogContent className="challenge-theme max-h-[90svh] overflow-y-auto"><DialogTitle>Примени навык. Измени привычный сценарий.</DialogTitle><DialogDescription>Новый разговор с партнёром</DialogDescription><p className="whitespace-pre-wrap border-l-2 border-gold pl-4">{day.skill_text}</p><p className="text-sm">Партнёр говорит: {day.partner_line}</p>{skillOpen&&<DayChat skillChat day={withoutShadow ? {...day,chosen_shadows:[]} : day} requestText={requestText} onProgress={value=>update(value)} onSummary={()=>{setSkillOpen(false);void next(7);}}/>}</DialogContent></Dialog>
      </div>
    </>}
    {day.step === 7 && <>
      <h1 className="text-4xl font-semibold">Было — Стало</h1>
      <div className="grid gap-6 sm:grid-cols-2"><div><h2 className="text-2xl text-gold">Было</h2><p className="mt-3">Партнёр сказал: {day.partner_line}</p><p className="mt-3">Твой персонаж чувствовал: {day.chosen_feelings.join(', ')}</p></div><div><h2 className="text-2xl text-gold">Стало</h2><p className="mt-3 whitespace-pre-wrap break-words">{day.new_dialogue_first_message}</p><p className="mt-3 whitespace-pre-wrap break-words">Твой персонаж может говорить так же — {day.setup_answers[3]}</p></div></div>
      <p className="whitespace-pre-wrap border-l-2 border-gold pl-4 leading-relaxed">{day.summary_text}</p>
      {requestText && <div className="space-y-3"><h2 className="text-2xl">Мой запрос</h2><p>{requestText}</p>{day.request_reflection.connection&&<p className="whitespace-pre-wrap">{day.request_reflection.connection}</p>}{day.request_reflection.action&&<p className="whitespace-pre-wrap">Моё решение: {day.request_reflection.action}</p>}</div>}
      <Btn disabled={saving || !day.summary_text} onClick={() => void finish()}>Закончить день {dayNumber}</Btn>
      <BookingActions/>
    </>}
    {failure && <><p role="alert" className="text-destructive">{failure}</p><Btn variant="ghost" onClick={() => void store(current.current)}>Повторить сохранение</Btn></>}
    {!userId && <p className="text-xs text-muted-foreground">Ответы сохранены в этом браузере. <a href="/profile" className="text-gold underline">Войти для сохранения в аккаунте</a></p>}
  </section>;
}

function DayChat({day, onProgress, onSummary, onApply, requestText, skillChat=false}: {day: IntroDay; onProgress: (patch: Partial<IntroDay>) => void; onSummary: () => void; onApply?: (skill:string) => void; requestText?:string|undefined; skillChat?:boolean}) {
  const [draft, setDraft] = useState(''), [failure, setFailure] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [reflectionOpen,setReflectionOpen]=useState(false),[questions,setQuestions]=useState('');
  const mode = useRef<'dialogue' | 'reflection' | 'summary'>('dialogue');
  const boundary = useRef<number | null>(null);
  const dayRef = useRef(day); dayRef.current = day;
  const progress = useRef(onProgress); progress.current = onProgress;
  const transport = useMemo(() => new DefaultChatTransport({api: '/api/intro-trainer', prepareSendMessagesRequest: ({messages}) => ({body: {cardId: day.card_id, level: day.partner_harshness as LevelKey, mode: mode.current, messages: textOnlyMessages(skillChat&&mode.current!=='dialogue'?[...dayRef.current.dialogue,...messages]:messages), introDay: dayContext({...dayRef.current,request_reflection:{...dayRef.current.request_reflection,requestText:requestText??''}})}})}), [day.card_id, day.partner_harshness,skillChat,requestText]);
  const {messages, sendMessage, status, stop} = useChat({id: `${day.id}${skillChat?'-skill':''}`, messages: skillChat?day.skill_dialogue:day.dialogue, transport, onError: error => {setFailure(error.message);mode.current='dialogue';}, onFinish: ({message}) => {
    if(mode.current==='reflection'){setQuestions(message.parts.filter(part=>part.type==='text').map(part=>part.text).join('\n'));}
    if (mode.current === 'summary') {
      const text = message.parts.filter(part => part.type === 'text').map(part => part.text).join('\n');
      if (text.trim()) {progress.current({summary_text: text}); onSummary();}
    }
  }});
  const busy = status === 'submitted' || status === 'streaming';
  const dialogue = textOnlyMessages(boundary.current === null ? messages : messages.slice(0, boundary.current));
  useEffect(() => {
    if (busy || mode.current !== 'dialogue') return;
    const first = dialogue.find(item => item.role === 'user');
    const firstText = first?.parts.filter(part => part.type === 'text').map(part => part.text).join('\n') ?? '';
    if (JSON.stringify(dialogue) !== JSON.stringify(skillChat?dayRef.current.skill_dialogue:dayRef.current.dialogue)) progress.current(skillChat?{skill_dialogue:dialogue}:{dialogue, new_dialogue_first_message: firstText});
  }, [messages, busy]);
  useEffect(() => () => {void stop();}, [stop]);
  return <div className="space-y-4">
    <div aria-label="Разговор с ИИ" className="max-h-96 space-y-4 overflow-y-auto border-y border-border py-4">{dialogue.map(message => <p key={message.id} className={`whitespace-pre-wrap break-words rounded-lg p-3 ${message.role === 'assistant' ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>{message.parts.filter(part => part.type === 'text').map(part => part.text).join('\n')}</p>)}{busy && <p role="status">{mode.current === 'summary' ? 'Собираем резюме…' : 'Партнёр отвечает…'}</p>}</div>
    {!reflectionOpen&&<><Textarea aria-label="Реплика твоего персонажа" placeholder="Реплика твоего персонажа…" maxLength={4000} disabled={busy} value={draft} onChange={event => setDraft(event.target.value)} />
    <Btn disabled={busy || !draft.trim()} onClick={() => {const text = draft.trim(); if (!text) return;mode.current='dialogue'; setFailure(''); setDraft(''); void sendMessage({text});}}>Отправить</Btn>
    {!skillChat&&<Btn variant="ghost" disabled={busy} onClick={() => setHelpOpen(value => !value)}>Не получается договориться</Btn>}
    {helpOpen && onApply && <DialogueHelp day={day} dialogue={dialogue} disabled={busy} onApply={skill=>{setHelpOpen(false);onApply(skill);}} />}
    <Btn disabled={busy || !dialogueComplete(dialogue)} onClick={() => {setFailure('');mode.current='reflection';boundary.current=messages.length;setReflectionOpen(true);void sendMessage({text:'Задай вопросы для завершения дня, в том числе по моему запросу, если он есть.'});}}>Завершить диалог</Btn></>}
    {reflectionOpen&&<div className="space-y-4"><h2 className="text-2xl text-gold">Перед резюме</h2>{questions&&<p aria-label="Вопросы ИИ" className="whitespace-pre-wrap">{questions}</p>}{requestText&&<p className="whitespace-pre-wrap border-l-2 border-gold pl-4">Мой запрос: {requestText}</p>}<p>Прочитай свой запрос, если он есть, и запиши решение, если ты его уже нашла. Если нет — жми «РЕЗЮМЕ». Следующая карта откроется завтра.</p><label className="grid gap-2"><span>{requestText?'Как это связано с твоим запросом?':'Что изменилось в диалоге?'}</span><Textarea aria-label="Связь с запросом" value={day.request_reflection.connection} maxLength={12000} disabled={busy} onChange={event=>onProgress({request_reflection:{...day.request_reflection,requestText:requestText??'',connection:event.target.value}})}/></label><label className="grid gap-2"><span>{requestText?'Как ты можешь решить свой запрос уже сейчас?':'Что ты берёшь из этого диалога?'}</span><Textarea aria-label="Найденное решение" value={day.request_reflection.action} maxLength={12000} disabled={busy} onChange={event=>onProgress({request_reflection:{...day.request_reflection,requestText:requestText??'',action:event.target.value}})}/></label><Btn disabled={busy||!questions} onClick={()=>{setFailure('');mode.current='summary';void sendMessage({text:'Подведи резюме «Было — Стало» с учётом моего запроса и записанных ответов. Если решения нет, не придумывай его за меня.'});}}>РЕЗЮМЕ</Btn>{failure&&<Btn variant="ghost" disabled={busy} onClick={()=>{mode.current='reflection';void sendMessage({text:'Задай вопросы для завершения дня.'});}}>Повторить вопросы</Btn>}</div>}
    {failure && <p role="alert" className="text-destructive">{failure}</p>}
  </div>;
}

function DialogueHelp({day, dialogue, disabled, onApply}: {day: IntroDay; dialogue: UIMessage[]; disabled: boolean; onApply: (skill:string) => void}) {
  const kind = useRef<'skill'>('skill');
  const current = useRef({day, dialogue}); current.current = {day, dialogue};
  const [failure, setFailure] = useState('');
  const transport = useMemo(() => new DefaultChatTransport({api: '/api/intro-trainer', prepareSendMessagesRequest: ({messages}) => ({body: {cardId: current.current.day.card_id, level: current.current.day.partner_harshness, mode: 'dialogue', introHelp: kind.current, introDay: dayContext(current.current.day), messages: textOnlyMessages([...current.current.dialogue, ...messages])}})}), []);
  const {messages, sendMessage, status, stop} = useChat({id: `${day.id}-help`, transport, onError: error => setFailure(error.message)});
  useEffect(() => () => {void stop();}, [stop]);
  const busy = status === 'submitted' || status === 'streaming';
  const ask = () => {setFailure(''); void sendMessage({text: 'Предложи новую демо-карточку навыка для этого диалога.'});};
  const skill=messages.filter(message=>message.role==='assistant').at(-1)?.parts.filter(part=>part.type==='text').map(part=>part.text).join('\n')??'';
  return <aside aria-label="Помощь в диалоге" className="space-y-4 rounded-lg border border-gold p-4">
    <h2 className="text-2xl text-gold">Попробуем другой подход</h2>
    <Btn variant="ghost" disabled={disabled || busy} onClick={ask}>Попробовать новую карту навыка</Btn>
    {messages.filter(message => message.role === 'assistant').map(message => <p key={message.id} className="whitespace-pre-wrap break-words leading-relaxed">{message.parts.filter(part => part.type === 'text').map(part => part.text).join('\n')}</p>)}
    {busy && <p role="status">ИИ ищет опору для диалога…</p>}
    {failure && <p role="alert" className="text-destructive">{failure}</p>}
    <Button variant="outline" disabled={disabled||busy||!skill.trim()||Boolean(failure)} onClick={()=>onApply(skill)}>Попробовать в диалоге</Button>
  </aside>;
}