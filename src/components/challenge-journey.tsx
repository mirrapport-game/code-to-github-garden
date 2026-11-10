import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LEVEL_META, type GameCard, type LevelKey } from '@/lib/cards';
import type { ChallengeAnswer } from '@/lib/challenge-store';
import { canContinueJourney, emptyJourney, finishJourney, type JourneyDraft, type JourneyStep } from '@/lib/challenge-journey';
import { SHADOW_SHADES } from '@/lib/shadow-shades';
import { SHADE_IMAGES } from '@/lib/shadow-shade-images';
import cover from '@/assets/shadow-shades-cover.jpg';
import { ChallengeStory } from '@/components/challenge-story';

export function ChallengeJourney({day,card,theme,shadeId,draft,onDraft,onComplete}: {day:number;card:GameCard;theme:string;shadeId?:string;draft?:Partial<ChallengeAnswer>;onDraft:(answer:Partial<ChallengeAnswer>)=>void;onComplete:(answer:ChallengeAnswer)=>void}) {
  const [answer,setAnswer] = useState<Partial<ChallengeAnswer>>(draft ?? {});
  const journey = {...emptyJourney(),...answer.journey};
  const step = journey.step;
  const shade = SHADOW_SHADES.find(item => item.id === shadeId);
  const image = shade ? SHADE_IMAGES[shade.id] : undefined;
  const name = shade?.name ?? theme;
  const update = (changes: Partial<JourneyDraft>, extra: Partial<ChallengeAnswer> = {}) => {
    const next = {...answer,...extra,journey:{...journey,...changes}};
    setAnswer(next); onDraft(next);
  };
  const go = (next:JourneyStep) => {update({step:next}); window.scrollTo(0,0);};
  const field = (key: keyof Pick<JourneyDraft,'before'|'rejected'|'recognition'|'repelled'|'meaning'|'where'|'afraid'|'replay'|'after'|'balance'|'resource'|'smallStep'>, label:string) => <label key={key} className="block space-y-3"><span className="font-semibold">{label}</span><textarea aria-label={label} value={journey[key]} onChange={event => update({[key]:event.target.value})} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold" /></label>;
  const next = (label:string,target:JourneyStep) => <Btn disabled={!canContinueJourney(step,journey,answer.level)} onClick={() => go(target)}>{label}</Btn>;
  const scenario = answer.level ? card.levels[answer.level].text : card.context;
  if (step === 'story') return <><ChallengeStory day={day} completeLabel="Оттенки тени" onComplete={() => {go('shadeMeaning');}} /><Btn className="mt-6" variant="ghost" onClick={() => go('reflection')}>К моей рефлексии</Btn></>;
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">День {day} / 7 · Знакомство с игрой</p>
    {step === 'scenario' && <>
      <h1 className="text-4xl font-semibold">{card.stage}</h1>
      <img src={card.cover} alt={`Карта «${card.stage}»`} className="gold-frame mx-auto aspect-[2/3] w-full max-w-64 rounded-lg object-contain shadow-card" />
      <h2 className="text-3xl font-semibold">{card.scenario}</h2><p className="whitespace-pre-line leading-relaxed">{card.context}</p>
      <h3 className="text-2xl">Какая сила ситуации тебе подходит сегодня?</h3>
      <RadioGroup aria-label="Сила ситуации" value={answer.level ?? ''} onValueChange={value => {if (value === 'soft' || value === 'medium' || value === 'hard') update({}, {level:value});}}>
        {(Object.keys(LEVEL_META) as LevelKey[]).map(key => <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={key} className="mt-1" /><span><span className={LEVEL_META[key].text}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</span><span className="block font-display text-xl">{card.levels[key].title}</span></span></label>)}
      </RadioGroup>
      {answer.level && <p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>}
      {next('Рефлексия','reflection')}
    </>}
    {step === 'reflection' && <>
      <h1 className="text-4xl font-semibold">Рефлексия</h1><p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>
      {field('before','Что ты чувствуешь в этой ситуации?')}
      {field('rejected','Какие качества в другом человеке тебе трудно принять?')}
      {field('recognition','Где ты узнаёшь себя?')}
      {field('repelled','Что тебя отталкивает?')}
      <p className="text-sm text-muted-foreground">Можно написать «не узнаю» или «пока не знаю». Чужая грубость не означает, что с тобой что-то не так.</p>
      {next('Оттенки тени','story')}<Btn variant="ghost" onClick={() => go('scenario')}>К сценарию</Btn>
    </>}
    {step === 'shadeMeaning' && <>
      <h1 className="text-4xl font-semibold">Оттенки тени</h1><h2 className="text-3xl text-gold">{name}</h2>
      <img src={cover} alt="Оттенки тени" className="gold-frame mx-auto aspect-[2/3] w-full max-w-56 rounded-lg object-contain shadow-card" />
      <p className="leading-relaxed">Эта карта выпала случайно. Не ярлык, а образ для пробы: что, если за закрытой дверью есть и сила, которой пока трудно пользоваться?</p>
      {field('meaning',`Что для тебя «${name}»?`)}
      {field('where',`Где и как ты проявляешь это качество — «${name}»?`)}
      {field('afraid',`Где ты боишься проявить это качество — «${name}»?`)}
      {next('Примерить тень в сценарии','shadePlay')}<Btn variant="ghost" onClick={() => go('reflection')}>К моей рефлексии</Btn>
    </>}
    {step === 'shadePlay' && <>
      <h1 className="text-4xl font-semibold">А если бы твоя тень была «{name}»?</h1>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>
      {field('replay','Что меняется в отыгрыше? Что ты сказала бы или сделала теперь?')}
      {field('after','Что ты чувствуешь после этой пробы?')}
      {image && <><p className="font-display text-2xl italic text-gold">{image.associations}</p><RadioGroup aria-label="Проявление тени" value={journey.manifestation} onValueChange={value => {if (value === 'shadow' || value === 'integrated' || value === 'neither') update({manifestation:value});}}>
        {[['shadow','Когда тень не интегрирована',image.shadow],['integrated','Когда тень интегрирована',image.integrated],['neither','Мне не подходит ни один образ','Можно оставить свой ответ. Карта не определяет, какая ты.']].map(([value,title,text]) => <label key={value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={value} className="mt-1 shrink-0" /><span><span className="block font-display text-2xl">{title}</span><span className="mt-2 block leading-relaxed">{text}</span></span></label>)}
      </RadioGroup></>}
      {next('Внедрение и поиск баланса','balance')}<Btn variant="ghost" onClick={() => go('shadeMeaning')}>К моему пониманию тени</Btn>
    </>}
    {step === 'balance' && <>
      <h1 className="text-4xl font-semibold">Внедрение и поиск баланса</h1>
      <p className="leading-relaxed">Интегрировать тень — не выпускать её за руль навсегда. Это взять её силу как инструмент: пользоваться, когда нужно, и убирать, когда она ранит тебя или других.</p>
      {image && <p className="border-l-2 border-gold pl-4 leading-relaxed">{image.integrated}</p>}
      {name === 'Наглость' && <p className="leading-relaxed">Не расталкивать всех локтями, а подвинуть себе стул. Сказать: «Я тоже хочу», попросить своё и оставить другому право ответить «нет».</p>}
      {field('balance',`Как ты используешь «${name}» в этой ситуации, сохраняя свои и чужие границы?`)}
      <p className="font-display text-2xl">В игре ты сможешь отыграть сценарий с живым человеком, получить обратную связь и попробовать свою тень в действии — чтобы заметить привычные автоматические реакции и поискать другой ответ.</p>
      <p className="text-sm text-muted-foreground">Не нужно терпеть давление или насилие. При угрозе важнее безопасность и поддержка.</p>
      {next('Забери ресурс','resource')}<Btn variant="ghost" onClick={() => go('shadePlay')}>К отыгрышу тени</Btn>
    </>}
    {step === 'resource' && <>
      <h1 className="text-4xl font-semibold">Забери ресурс</h1>
      <p className="leading-relaxed">Ресурс — то, на что ты можешь опереться: право сказать «нет», попросить, взять паузу, занять своё место. Выбери то, что действительно поддерживает тебя.</p>
      {field('resource','Какой ресурс ты забираешь из этой пробы?')}
      <h2 className="text-3xl">Маленький шаг</h2><p className="leading-relaxed">Не менять всё сразу, а сделать одну посильную пробу: произнести ясную фразу, попросить о помощи или дать себе время на ответ.</p>
      {field('smallStep','Какой маленький шаг ты сделаешь?')}
      <Btn disabled={!canContinueJourney('resource',journey,answer.level)} onClick={() => {const entry=finishJourney(answer,journey,card,day,theme,shadeId);if(entry) onComplete(entry);}}>ИТОГ</Btn>
      <Btn variant="ghost" onClick={() => go('balance')}>К поиску баланса</Btn>
    </>}
  </div>;
}