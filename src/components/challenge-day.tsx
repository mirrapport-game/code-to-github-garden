import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LEVEL_META, type GameCard, type LevelKey } from '@/lib/cards';
import type { ChallengeAnswer } from '@/lib/challenge-store';
import { cardChoices } from '@/lib/card-choices';
import { ChoiceReflection } from '@/components/choice-reflection';
import { ChallengeStory } from '@/components/challenge-story';
import { CHALLENGE_STORIES } from '@/lib/challenge-story';

export function ChallengeDay({ day, card, theme = card.stage, shadeId, draft, introductory = false, onDraft, onComplete }: { day: number; card: GameCard; theme?: string; shadeId?: string | undefined; draft?: Partial<ChallengeAnswer> | undefined; introductory?: boolean; onDraft: (draft: Partial<ChallengeAnswer>) => void; onComplete: (entry: ChallengeAnswer) => void }) {
  const [step, setStep] = useState<'story' | 'cover' | 'level' | 'answers' | 'reflection' | 'personal'>(!introductory && !draft?.storyRead ? 'story' : draft?.choiceId ? 'reflection' : introductory && draft?.level ? 'answers' : 'cover');
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<Partial<ChallengeAnswer>>(draft ?? {});
  const update = (values: Partial<ChallengeAnswer>) => { const next = {...answer, ...values, shadeId, stage:theme, cardId:card.id, cardStage:card.stage, day}; setAnswer(next); onDraft(next); };
  const next = (value: typeof step) => { setStep(value); window.scrollTo(0,0); };
  const choices = answer.level ? cardChoices(theme, answer.level, card.id) : [];
  const selected = choices.find(item => item.id === answer.choiceId);
  const story = CHALLENGE_STORIES[day - 1];
  const complete = () => { if (!selected) return; onComplete({day,stage:theme,shadeId,shadowAnswers:answer.shadowAnswers,cardId:card.id,cardStage:card.stage,responseText:selected.text,level:answer.level ?? 'soft',choiceId:selected.id,feelings:[],body:[],hurt:selected.text,shadow:'',resource:selected.resource,practice:[],storyRead:answer.storyRead,personalAnswer:answer.personalAnswer ?? '',revisitedChoiceId:answer.revisitedChoiceId ?? '',doneAt:new Date().toISOString()}); };
  if (step === 'story') return <ChallengeStory day={day} onComplete={() => {update({storyRead:true}); next('cover');}} />;
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">{introductory ? 'Первая карта' : `День ${day} / 7`}</p>
    <h1 className="text-4xl font-semibold">{card.stage}</h1>
    <p className="text-sm text-gold">{theme}{card.source !== 'official' && ' · Демо-сценарий'}</p>
    {step === 'cover' && <>
      <div className="mx-auto w-full max-w-xs"><Btn variant="ghost" className="gold-frame relative aspect-[2/3] overflow-auto rounded-lg p-0 shadow-card" onClick={() => setFlipped(!flipped)}>{flipped ? <div className="flex min-h-full flex-col justify-center gap-4 px-5 py-6"><span className="font-display text-2xl">{card.scenario}</span><span className="whitespace-pre-line text-sm font-normal leading-relaxed">{card.context}</span></div> : <img src={card.cover} alt={`Карта «${card.stage}»`} className="absolute inset-0 h-full w-full object-contain" />}</Btn></div>
      <Btn onClick={() => next('level')}>Открыть карту</Btn>
    </>}
    {step === 'level' && <>
      <h2 className="text-2xl font-semibold">{card.scenario}</h2><p className="leading-relaxed">{card.context}</p>
      <h3 className="text-2xl">Какая сила ситуации тебе подходит сегодня?</h3>
      <RadioGroup aria-label="Сила ситуации" value={answer.level ?? ''} onValueChange={value => update({level:value as LevelKey, choiceId:''})}>
        {(Object.keys(LEVEL_META) as LevelKey[]).map(key => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem id={`level-${day}-${key}`} value={key} /><span><span className={LEVEL_META[key].text}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</span><span className="block font-display text-xl">{card.levels[key].title}</span></span></label>)}
      </RadioGroup>
      {answer.level && <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>}
      <Btn disabled={!answer.level} onClick={() => next('answers')}>К ответам</Btn>
    </>}
    {step === 'answers' && answer.level && <>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>
      <h2 className="text-3xl font-semibold">Узнаёшь себя в этой ситуации?</h2>
      <p className="font-display text-2xl">{theme}: где это проявляется в твоей жизни?</p>
      <p className="text-sm text-muted-foreground">Нет правильного ответа. Что ближе тебе сейчас?</p>
      <RadioGroup aria-label="Твой ответ на карту" value={answer.choiceId ?? ''} onValueChange={choiceId => update({choiceId})}>
        {choices.map(choice => <label key={choice.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem className="mt-1 shrink-0" id={`answer-${day}-${choice.id}`} value={choice.id} /><span className="leading-relaxed">{choice.text}</span></label>)}
      </RadioGroup>
      <Btn disabled={!selected} onClick={() => next('reflection')}>Узнать себя</Btn>
      <Btn variant="ghost" onClick={() => next('level')}>Изменить силу ситуации</Btn>
    </>}
    {step === 'reflection' && selected && <>
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
