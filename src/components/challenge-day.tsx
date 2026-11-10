import { useRef, useState } from 'react';
import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LEVEL_META, type GameCard, type LevelKey } from '@/lib/cards';
import type { ChallengeAnswer } from '@/lib/challenge-store';
import { cardChoices } from '@/lib/card-choices';
import { ChoiceReflection } from '@/components/choice-reflection';
import { ChallengeStory } from '@/components/challenge-story';
import { CHALLENGE_STORIES } from '@/lib/challenge-story';
import { introReflectionComplete } from '@/lib/intro-choices';
import { IntroReflection } from '@/components/intro-reflection';
import { IntroIntegration } from '@/components/intro-integration';
import { emptyIntegration, pickIntegrationQuality, integrationProfile } from '@/lib/intro-integration';
import { IntroTrainer } from '@/components/intro-trainer';
import { dialogueUI } from '@/lib/intro-trainer';
import { practiceSupport } from '@/lib/integration-practice';

export function ChallengeDay({ day, card, theme = card.stage, shadeId, draft, introductory = false, onDraft, onComplete }: { day: number; card: GameCard; theme?: string; shadeId?: string | undefined; draft?: Partial<ChallengeAnswer> | undefined; introductory?: boolean; onDraft: (draft: Partial<ChallengeAnswer>) => void; onComplete: (entry: ChallengeAnswer) => void }) {
  const [step, setStep] = useState<'story' | 'cover' | 'level' | 'answers' | 'reflection' | 'introSummary' | 'integration' | 'personal'>(introductory && draft?.introIntegration ? 'integration' : !introductory && !draft?.storyRead ? 'story' : draft?.choiceId || draft?.firstDialogueComplete ? 'reflection' : introductory && draft?.level ? 'answers' : 'cover');
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<Partial<ChallengeAnswer>>(draft ?? {});
  const answerRef=useRef(answer);
  const update = (values: Partial<ChallengeAnswer>) => { const next = {...answerRef.current, ...values, shadeId, stage:theme, cardId:card.id, cardStage:card.stage, day}; answerRef.current=next; setAnswer(next); onDraft(next); };
  const next = (value: typeof step) => { setStep(value); window.scrollTo(0,0); };
  const choices = answer.level ? cardChoices(theme, answer.level, card.id) : [];
  const selected = choices.find(item => item.id === answer.choiceId);
  const story = CHALLENGE_STORIES[day - 1];
  const integration = answer.introIntegration;
  const integrationQuality = pickIntegrationQuality(answer.introReflection?.notAllowed ?? []);
  const profile = integrationQuality ? integrationProfile(integrationQuality) : undefined;
  const support = practiceSupport(profile?.name ?? theme, profile?.integrated ?? 'Замечать свои чувства и спокойно обозначать потребности.');
  const response = answer.dialogue?.find(turn=>turn.role==='participant')?.text ?? selected?.text ?? '';
  const ready = introductory ? Boolean(answer.firstDialogueComplete || answer.choiceId) : Boolean(selected);
  const complete = () => { if (!ready || (introductory && !introReflectionComplete(answer))) return; onComplete({day,stage:theme,shadeId,shadowAnswers:answer.shadowAnswers,cardId:card.id,cardStage:card.stage,responseText:response,dialogue:answer.dialogue ?? [],firstDialogueComplete:answer.firstDialogueComplete ?? false,level:answer.level ?? 'soft',choiceId:selected?.id ?? '',feelings:answer.feelings ?? [],body:[],hurt:introductory ? answer.hurt ?? '' : response,shadow:answer.shadow ?? '',introReflection:answer.introReflection,introIntegration:integration,resource:integration?.step === 'summary' ? integration.resource : introductory ? support.resource : selected?.resource ?? '',practice:integration?.step === 'summary' ? [integration.balance,integration.smallStep] : introductory ? [support.smallStep] : [],storyRead:answer.storyRead ?? false,personalAnswer:answer.personalAnswer ?? '',revisitedChoiceId:answer.revisitedChoiceId ?? '',doneAt:new Date().toISOString()}); };
  if (step === 'story') return <ChallengeStory day={day} onComplete={() => {update({storyRead:true}); next('cover');}} />;
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">{introductory ? 'Первая карта' : `День ${day} / 7`}</p>
    <h1 className="text-4xl font-semibold">{card.stage}</h1>
    {!introductory && <p className="text-sm text-gold">{theme}{card.source !== 'official' && ' · Демо-сценарий'}</p>}
    {step === 'cover' && <>
      <p className="leading-relaxed">Сейчас ты откроешь ситуацию из игры. Прочитай её и представь себя на месте героини: что тебя в ней задевает? Где ты узнаёшь себя? Пока просто замечай свой отклик — отвечать сразу не нужно.</p>
      <div className="mx-auto w-full max-w-xs"><Btn variant="ghost" className="gold-frame relative aspect-[2/3] overflow-auto rounded-lg p-0 shadow-card" onClick={() => setFlipped(!flipped)}>{flipped ? <div className="flex min-h-full flex-col justify-center gap-4 px-5 py-6"><span className="font-display text-2xl">{card.scenario}</span><span className="whitespace-pre-line text-sm font-normal leading-relaxed">{card.context}</span></div> : <img src={card.cover} alt={`Карта «${card.stage}»`} className="absolute inset-0 h-full w-full object-contain" />}</Btn></div>
      <Btn onClick={() => next('level')}>Открыть карту</Btn>
    </>}
    {step === 'level' && <>
      <h2 className="text-2xl font-semibold">{card.scenario}</h2><p className="leading-relaxed">{card.context}</p>
      <h3 className="text-2xl">Выбери степень жёсткости партнёра</h3>
      <p className="leading-relaxed">Партнёр — это другой человек в ситуации. Мягкая, средняя или жёсткая: выбери, насколько напряжённым будет ваше взаимодействие сегодня. Затем прочитай выбранный вариант. Начни с того уровня, с которым тебе комфортно; его можно изменить.</p>
      <RadioGroup aria-label="Сила ситуации" value={answer.level ?? ''} onValueChange={value => update({level:value as LevelKey, choiceId:'',dialogue:[],firstDialogueComplete:false})}>
        {(Object.keys(LEVEL_META) as LevelKey[]).map(key => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem id={`level-${day}-${key}`} value={key} /><span><span className={LEVEL_META[key].text}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</span><span className="block font-display text-xl">{card.levels[key].title}</span></span></label>)}
      </RadioGroup>
      {answer.level && <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>}
      <Btn disabled={!answer.level} onClick={() => next('answers')}>{introductory ? 'Начать диалог' : 'К ответам'}</Btn>
      <Btn variant="ghost" onClick={() => next('cover')}>Назад</Btn>
    </>}
    {step === 'answers' && answer.level && introductory && <>
      <h2 className="text-3xl font-semibold">Узнаёшь себя в этой ситуации?</h2>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>
      <p className="leading-relaxed">Напиши, как бы ты на самом деле ответила этому человеку. Начни диалог — ИИ сыграет партнёра в этой ситуации.</p>
      <IntroTrainer key={`first-${card.id}-${answer.level}`} sessionId={`first-${card.id}-${answer.level}`} cardId={card.id ?? ''} level={answer.level} minMessages={5} maxParticipantMessages={4} withFeedback={false} placeholder="Как бы я на самом деле ответила…" initialMessages={dialogueUI(answer.dialogue)} initialSummary="" onProgress={dialogue=>update({dialogue})} onComplete={dialogue=>{update({dialogue,firstDialogueComplete:true});next('reflection');}} />
      <Btn variant="ghost" onClick={() => next('level')}>Изменить жёсткость партнёра</Btn>
    </>}
    {step === 'answers' && answer.level && !introductory && <>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>
      <h2 className="text-3xl font-semibold">Узнаёшь себя в этой ситуации?</h2>
      {!introductory && <p className="font-display text-2xl">{theme}: где это проявляется в твоей жизни?</p>}
      <p className="text-sm text-muted-foreground">Нет правильного ответа. Что ближе тебе сейчас?</p>
      <RadioGroup aria-label="Твой ответ на карту" value={answer.choiceId ?? ''} onValueChange={choiceId => update({choiceId})}>
        {choices.map(choice => <label key={choice.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem className="mt-1 shrink-0" id={`answer-${day}-${choice.id}`} value={choice.id} /><span className="leading-relaxed">{choice.text}</span></label>)}
      </RadioGroup>
      {selected&&<p className="border-l-2 border-gold pl-4 leading-relaxed">{selected.reflection}</p>}
      <Btn disabled={!selected} onClick={() => next('reflection')}>Узнать себя</Btn>
      <Btn variant="ghost" onClick={() => next('level')}>Изменить жёсткость партнёра</Btn>
    </>}
    {step === 'reflection' && ready && introductory && <>
      <h2 className="text-3xl font-semibold">Рефлексия</h2>
      <p className="leading-relaxed">Теперь обрати внимание на свой отклик: что ты чувствуешь, какие качества другого человека тебя задевают и какой ты не разрешаешь быть себе. Можно выбрать несколько вариантов — здесь нет правильных или неправильных ответов.</p>
      <p className="font-display text-2xl">Прочитай ещё раз сценарий и выбери чувства и качества, которые откликаются.</p>
      <h3 className="text-2xl font-semibold">{card.scenario}</h3>
      <p className="whitespace-pre-line border-l-2 border-gold pl-4 leading-relaxed">{answer.level ? card.levels[answer.level].text : card.context}</p>
      <IntroReflection answer={answer} onChange={values => {
        const changedQuality = values.introReflection && JSON.stringify(values.introReflection.notAllowed) !== JSON.stringify(answer.introReflection?.notAllowed);
        update({...values,...(changedQuality ? {introIntegration:undefined} : {})});
      }} />
      <Btn disabled={!introReflectionComplete(answer)} onClick={() => next('introSummary')}>ИТОГ</Btn>
      <Btn variant="ghost" onClick={() => next('answers')}>К первому диалогу</Btn>
    </>}
    {step === 'introSummary' && ready && introductory && <>
      <h2 className="text-3xl font-semibold">Итог</h2>
      <section><h3 className="text-2xl font-semibold">Тень</h3><p className="mt-3 whitespace-pre-line leading-relaxed">{answer.introReflection?.notAllowed.map(quality=>integrationProfile(quality)?.name ?? quality).join(', ')}</p><p className="mt-2 text-sm text-muted-foreground">То, что ты пока не позволяешь себе, по твоему выбору.</p></section>
      <section><h3 className="text-2xl font-semibold">Качество</h3><p className="mt-3 leading-relaxed">{answer.introReflection?.qualities.join(', ')}</p><p className="mt-2 text-sm text-muted-foreground">{answer.introReflection?.spheres.join(' · ')}</p></section>
      {answer.introReflection?.strength && <section><h3 className="text-2xl font-semibold">Сила</h3><p className="mt-3 whitespace-pre-line leading-relaxed">{answer.introReflection.strength}</p></section>}
      <section><h3 className="text-2xl font-semibold">Чего боюсь</h3><p className="mt-3 leading-relaxed">{answer.introReflection?.fears?.join(', ')}</p></section>
      <section><h3 className="text-2xl font-semibold">Ресурс</h3><p className="mt-3 leading-relaxed">{support.resource}</p></section>
      {integrationQuality ? <Btn onClick={()=>{if (!integration) update({introIntegration:emptyIntegration(integrationQuality)});next('integration');}}>{integration?.step === 'summary' ? 'Посмотреть интеграцию тени' : 'Посмотреть на оттенок тени'}</Btn> : <p className="text-sm text-muted-foreground">Пока можно оставить «не знаю». Чтобы попробовать интеграцию, выбери в рефлексии качество, которое себе не позволяешь.</p>}
      <Btn onClick={complete}>Завершить первую карту</Btn>
      <Btn variant="ghost" onClick={() => next('reflection')}>К моим ответам</Btn>
    </>}
    {step === 'integration' && introductory && integration && <IntroIntegration value={integration.step==='meaning'?{...integration,step:'manifestations'}:integration} selected={answer.introReflection?.notAllowed ?? []} card={card} theme={theme} level={answer.level} scenario={answer.level ? card.levels[answer.level].text : card.context} before={answer.feelings ?? []} onChange={introIntegration=>update({...introIntegration.feedback?{introIntegration:{...introIntegration,...support}}:{introIntegration}})} onBack={()=>next('introSummary')} onFinish={complete} />}
    {step === 'reflection' && selected && !introductory && <>
      <ChoiceReflection showShade={!introductory} onShadowAnswers={shadowAnswers => update({shadowAnswers})} answer={{...answer,shadeId,stage:theme,cardId:card.id,cardStage:card.stage}} />
      {!introductory && <Btn onClick={() => next('personal')}>Ответить ещё раз своими словами</Btn>}
      <Btn variant={introductory ? 'gold' : 'ghost'} onClick={complete}>{introductory ? 'Завершить первую карту' : `Сохранить день ${day}`}</Btn>
      <Btn variant="ghost" onClick={() => next('answers')}>Выбрать другой ответ</Btn>
    </>}
    {step === 'personal' && selected && <>
      <h2 className="text-3xl font-semibold">Мой ответ теперь</h2>
      {answer.level && <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>}
      <p className="font-display text-2xl">{story?.question}</p>
      <p className="text-sm text-muted-foreground">Первый выбор останется сохранён. Новый ответ может быть таким же — менять его не обязательно.</p>
      <RadioGroup aria-label="Мой повторный выбор" value={answer.revisitedChoiceId ?? ''} onValueChange={revisitedChoiceId => update({revisitedChoiceId})}>{choices.map(choice => <label key={choice.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem className="mt-1 shrink-0" value={choice.id} /><span>{choice.text}</span></label>)}</RadioGroup>
      <label className="block space-y-3"><span className="font-semibold">Мой ответ своими словами</span><textarea aria-label="Мой ответ своими словами" value={answer.personalAnswer ?? ''} onChange={e => update({personalAnswer:e.target.value})} className="min-h-36 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold" /></label>
      <Btn onClick={complete}>Записать ответ и сохранить день {day}</Btn>
      <Btn variant="ghost" onClick={() => next('reflection')}>Вернуться к рефлексии</Btn>
    </>}
  </div>;
}
