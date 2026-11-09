import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LEVEL_META, type GameCard, type LevelKey } from '@/lib/cards';
import type { ChallengeAnswer } from '@/lib/challenge-store';
import { cardChoices } from '@/lib/card-choices';
import { ChoiceReflection } from '@/components/choice-reflection';

export function ChallengeDay({ day, card, draft, onDraft, onComplete }: { day: number; card: GameCard; draft?: Partial<ChallengeAnswer>; onDraft: (draft: Partial<ChallengeAnswer>) => void; onComplete: (entry: ChallengeAnswer) => void }) {
  const [step, setStep] = useState<'cover' | 'level' | 'answers' | 'reflection'>('cover');
  const [answer, setAnswer] = useState<Partial<ChallengeAnswer>>(draft ?? {});
  const update = (values: Partial<ChallengeAnswer>) => { const next = {...answer, ...values, stage:card.stage, day}; setAnswer(next); onDraft(next); };
  const next = (value: typeof step) => { setStep(value); window.scrollTo(0,0); };
  const choices = answer.level ? cardChoices(card.stage, answer.level) : [];
  const selected = choices.find(item => item.id === answer.choiceId);
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">День {day} / 7</p>
    <h1 className="text-4xl font-semibold">{card.stage}</h1>
    <p className="text-xs text-muted-foreground">Демо-сценарий</p>
    {step === 'cover' && <>
      <div className="relative mx-auto aspect-[2/3] w-full max-w-xs overflow-hidden rounded-lg"><img src={card.cover} alt="Общая фотография колоды Раппорт: ЖиваЯ" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 bg-night/95 px-4 py-6 font-display text-3xl text-gold-soft">{card.stage}</span></div>
      <Btn onClick={() => next('level')}>Открыть карту</Btn>
    </>}
    {step === 'level' && <>
      <h2 className="text-2xl font-semibold">{card.scenario}</h2><p className="leading-relaxed">{card.context}</p>
      <h3 className="text-2xl">Какая сила ситуации тебе подходит сегодня?</h3>
      <RadioGroup aria-label="Сила ситуации" value={answer.level ?? ''} onValueChange={value => update({level:value as LevelKey, choiceId:undefined})}>
        {(Object.keys(LEVEL_META) as LevelKey[]).map(key => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4"><RadioGroupItem id={`level-${day}-${key}`} value={key} /><span>{LEVEL_META[key].icon} {LEVEL_META[key].label}</span></label>)}
      </RadioGroup>
      {answer.level && <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>}
      <Btn disabled={!answer.level} onClick={() => next('answers')}>К ответам</Btn>
    </>}
    {step === 'answers' && answer.level && <>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{card.levels[answer.level].text}</p>
      <h2 className="text-3xl font-semibold">Как бы ты ответила?</h2>
      <p className="text-sm text-muted-foreground">Нет правильного ответа. Что ближе тебе сейчас?</p>
      <RadioGroup aria-label="Твой ответ на карту" value={answer.choiceId ?? ''} onValueChange={choiceId => update({choiceId})}>
        {choices.map(choice => <label key={choice.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem className="mt-1 shrink-0" id={`answer-${day}-${choice.id}`} value={choice.id} /><span className="leading-relaxed">{choice.text}</span></label>)}
      </RadioGroup>
      <Btn disabled={!selected} onClick={() => next('reflection')}>Узнать себя</Btn>
      <Btn variant="ghost" onClick={() => next('level')}>Изменить силу ситуации</Btn>
    </>}
    {step === 'reflection' && selected && <>
      <ChoiceReflection answer={{...answer,stage:card.stage}} />
      <Btn onClick={() => onComplete({day,stage:card.stage,level:answer.level ?? 'soft',choiceId:selected.id,feelings:[],body:[],hurt:selected.text,shadow:'',resource:selected.resource,practice:[],doneAt:new Date().toISOString()})}>Сохранить день {day}</Btn>
      <Btn variant="ghost" onClick={() => next('answers')}>Выбрать другой ответ</Btn>
    </>}
  </div>;
}
