import { useState } from 'react';
import { Btn, Chips } from '@/components/game-ui';
import { BODY, FEELINGS, LEVEL_META, type GameCard, type LevelKey } from '@/lib/cards';
import { PRACTICES } from '@/lib/challenge';
import type { ChallengeAnswer } from '@/lib/challenge-store';

export function ChallengeDay({ day, card, name, suggested, draft, onDraft, onComplete }: { day: number; card: GameCard; name: string; suggested: LevelKey; draft?: Partial<ChallengeAnswer> | undefined; onDraft: (draft: Partial<ChallengeAnswer>) => void; onComplete: (entry: ChallengeAnswer) => void }) {
  const [step, setStep] = useState<'cover' | 'level' | 'answers'>('cover');
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<Partial<ChallengeAnswer>>(draft ?? { feelings: [], body: [], hurt: '', shadow: '', resource: '', practice: [] });
  const practice = PRACTICES[day-1];
  if (!practice) return null;
  const update = (values: Partial<ChallengeAnswer>) => { const next = {...answer,...values}; setAnswer(next); onDraft(next); };
  const next = (value: typeof step) => {setStep(value); window.scrollTo(0,0);};
  const valid = Boolean(answer.level && answer.feelings?.length && answer.hurt?.trim() && answer.resource?.trim() && (day === 1 || answer.shadow?.trim()) && practice.questions.every((_,i) => answer.practice?.[i]?.trim()));
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">День {day} / 7 · {practice.title}</p>
    <h1 className="text-4xl font-semibold">{card.stage}</h1>
    <p className="text-xs text-muted-foreground">Демо-сценарий · {day === 1 ? 'Первая встреча' : name + ', новая грань знакомой игры'}</p>
    {step === 'cover' && <>
      <div className="mx-auto max-w-xs">
        <Btn variant="ghost" className="relative aspect-[2/3] overflow-hidden rounded-lg p-0" onClick={() => setFlipped(!flipped)}>
          {flipped ? <div className="flex h-full flex-col justify-center gap-5 px-6"><span className="font-display text-3xl">{card.scenario}</span><span className="text-sm font-normal leading-relaxed">{card.context}</span></div> : <><img src={card.cover} alt="Карты Раппорт: ЖиваЯ — общая фотография колоды" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 bg-night/95 px-4 py-6 font-display text-3xl text-gold-soft">{card.stage}</span></>}
        </Btn>
        <p className="mt-2 text-center text-xs text-muted-foreground">Общая фотография колоды · авторская обложка ожидается</p>
      </div>
      <Btn onClick={() => next('level')}>Открыть карту</Btn>
    </>}
    {step === 'level' && <>
      <h2 className="text-2xl font-semibold">{card.scenario}</h2><p className="leading-relaxed">{card.context}</p>
      <p className="text-sm text-muted-foreground">По входному тесту предлагаем {suggested === 'soft' ? 'мягкий' : 'средний'} уровень. Что сейчас проще? Финальный выбор — твой.</p>
      {(Object.keys(LEVEL_META) as LevelKey[]).map(key => <div key={key} className="rounded-lg border border-border bg-card p-4">
        <Btn variant={answer.level === key ? 'night' : 'ghost'} onClick={() => update({level: key})}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</Btn>
        {answer.level === key && <p className="mt-4 leading-relaxed">{card.levels[key].text}</p>}
      </div>)}
      <Btn disabled={!answer.level} onClick={() => next('answers')}>Войти в эту ситуацию</Btn>
    </>}
    {step === 'answers' && answer.level && <>
      <p className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-muted-foreground">{card.levels[answer.level].text}</p>
      <section className="border-y border-border py-5"><h2 className="text-2xl font-semibold">{practice.title}</h2><p className="mt-3 leading-relaxed">{practice.concept}</p></section>
      <section className="space-y-3"><h3 className="font-sans font-semibold">Что ты чувствуешь?</h3><Chips items={FEELINGS} value={answer.feelings ?? []} onChange={feelings => update({feelings})} /><p className="text-sm">Где в теле отклик?</p><Chips items={BODY} value={answer.body ?? []} onChange={body => update({body})} /></section>
      {([['hurt','Что именно задевает: фраза, жест, действие?'], ...(day > 1 ? [['shadow','Что ты не разрешаешь себе в этой ситуации?']] : []), ['resource','Что бы ты ответила подруге?']] as [ 'hurt' | 'shadow' | 'resource', string][]).map(([key,label]) => <label key={key} className="block space-y-2 font-semibold">{label}<textarea aria-label={label} value={answer[key] ?? ''} onChange={e => update({[key]: e.target.value})} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 font-normal outline-none focus:border-gold" /></label>)}
      {practice.questions.map((question,i) => <label key={question} className="block space-y-2 font-semibold">{question}<textarea aria-label={question} value={answer.practice?.[i] ?? ''} onChange={e => {const values = [...(answer.practice ?? [])]; values[i] = e.target.value; update({practice:values});}} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 font-normal outline-none focus:border-gold" /></label>)}
      <Btn disabled={!valid} onClick={() => onComplete({day, stage:card.stage, level:answer.level ?? 'soft', feelings:answer.feelings ?? [], body:answer.body ?? [], hurt:answer.hurt ?? '', shadow:answer.shadow ?? '', resource:answer.resource ?? '', practice:answer.practice ?? [], doneAt:new Date().toISOString()})}>Сохранить день {day}</Btn>
      <Btn variant="ghost" onClick={() => next('level')}>Выбрать другую силу ситуации</Btn>
    </>}
  </div>;
}