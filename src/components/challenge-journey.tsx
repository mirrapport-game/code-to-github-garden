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
import { practiceRatingQuestion, practiceReactions, practiceSupport } from '@/lib/integration-practice';
import { PracticeFeelings, PracticeRating } from '@/components/practice-controls';
import { ShadeComparison } from '@/components/shade-assessment';

export function ChallengeJourney({day,card,theme,shadeId,draft,onDraft,onComplete}: {day:number;card:GameCard;theme:string;shadeId?:string | undefined;draft?:Partial<ChallengeAnswer> | undefined;onDraft:(answer:Partial<ChallengeAnswer>)=>void;onComplete:(answer:ChallengeAnswer)=>void}) {
  const [answer,setAnswer]=useState<Partial<ChallengeAnswer>>(draft??{});
  const journey={...emptyJourney(),...answer.journey};
  const step=journey.step==='balance'?'feelings':journey.step;
  const shade=SHADOW_SHADES.find(item=>item.id===shadeId);
  const image=shade?SHADE_IMAGES[shade.id]:undefined;
  const name=shade?.name??theme;
  const integrated=image?.integrated??shade?.integrated??'Обозначать свои потребности, уважая свои и чужие границы.';
  const support=practiceSupport(name,integrated);
  const reactions=practiceReactions(name,integrated);
  const update=(changes:Partial<JourneyDraft>,extra:Partial<ChallengeAnswer>={})=>{const value={...answer,...extra,journey:{...journey,...changes}};setAnswer(value);onDraft(value);};
  const go=(target:JourneyStep)=>{update({step:target,...(target==='resource'?support:{})});window.scrollTo(0,0);};
  const field=(key:'before'|'rejected'|'recognition'|'repelled'|'where'|'afraid',label:string)=><label className="block space-y-3"><span className="font-semibold">{label}</span><textarea autoComplete="off" aria-label={label} value={journey[key]} onChange={event=>update({[key]:event.target.value})} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold"/></label>;
  const next=(label:string,target:JourneyStep)=><Btn disabled={!canContinueJourney(step,journey,answer.level)} onClick={()=>go(target)}>{label}</Btn>;
  const scenario=answer.level?card.levels[answer.level].text:card.context;
  const steps:JourneyStep[]=['scenario','reflection','story','shadeMeaning','shadeView','shadePlay','feelings','resource'];
  const index=steps.indexOf(step);
  if(step==='story')return <><ChallengeStory day={day} completeLabel="Интегрировать тень" onComplete={()=>go('shadeMeaning')}/><Btn className="mt-6" variant="ghost" onClick={()=>go('reflection')}>Назад</Btn></>;
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">День {day} / 7 · Знакомство с игрой</p><p className="text-sm text-muted-foreground">Шаг {index+1} из {steps.length}</p>
    {step==='scenario'&&<>
      <h1 className="text-4xl font-semibold">{card.stage}</h1><img src={card.cover} alt={`Карта «${card.stage}»`} className="gold-frame mx-auto aspect-[2/3] w-full max-w-64 rounded-lg object-contain shadow-card"/>
      <h2 className="text-3xl font-semibold">{card.scenario}</h2><p className="whitespace-pre-line leading-relaxed">{card.context}</p><h3 className="text-2xl">Какая сила ситуации тебе подходит сегодня?</h3>
      <RadioGroup aria-label="Сила ситуации" value={answer.level??''} onValueChange={level=>{if(level==='soft'||level==='medium'||level==='hard')update({},{level});}}>{(Object.keys(LEVEL_META) as LevelKey[]).map(key=><label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={key} className="mt-1"/><span><span className={LEVEL_META[key].text}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</span><span className="block font-display text-xl">{card.levels[key].title}</span></span></label>)}</RadioGroup>
      {answer.level&&<p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>}{next('Рефлексия','reflection')}
    </>}
    {step==='reflection'&&<>
      <h1 className="text-4xl font-semibold">Рефлексия</h1><p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>
      <PracticeFeelings value={journey.before?journey.before.split(', '):[]} onChange={feelings=>update({before:feelings.join(', ')})}/>
      {field('rejected','Какие качества в другом человеке тебе трудно принять?')}{field('recognition','Где ты узнаёшь себя?')}{field('repelled','Что тебя отталкивает?')}
      {next('Далее','story')}
    </>}
    {step==='shadeMeaning'&&<>
      <h1 className="text-4xl font-semibold">Оттенки тени</h1><h2 className="text-3xl text-gold">{name}</h2><p className="text-sm text-muted-foreground">Случайная карта — образ для пробы, а не вывод о тебе.</p>
      <PracticeRating question={practiceRatingQuestion(name)} value={journey.shadeBefore?.mode==='scale'?journey.shadeBefore.rating:undefined} onChange={rating=>update({shadeBefore:{mode:'scale',rating}})}/>
      {field('where','Где ты проявляешь это качество?')}{field('afraid','Где боишься проявлять?')}{next('Посмотреть с другой стороны','shadeView')}
    </>}
    {step==='shadeView'&&<>
      <h1 className="text-4xl font-semibold">Посмотри на оттенок тени с другой стороны</h1><h2 className="text-3xl text-gold">{name}</h2><img src={cover} alt="Оттенки тени" className="gold-frame mx-auto aspect-[2/3] w-full max-w-56 rounded-lg object-contain shadow-card"/>
      <section className="border-l-2 border-gold pl-4"><h3 className="text-2xl">Теневое проявление</h3><p className="mt-2 leading-relaxed">{image?.shadow??shade?.shadow}</p></section>
      <section className="border-l-2 border-gold pl-4"><h3 className="text-2xl">Интегрированное проявление</h3><p className="mt-2 leading-relaxed">{integrated}</p></section>
      <p className="leading-relaxed">Попробуй интегрировать оттенок тени и выбрать новую реакцию — сохраняя свои и чужие границы.</p>{next('Выбрать новую реакцию','shadePlay')}
    </>}
    {step==='shadePlay'&&<>
      <h1 className="text-4xl font-semibold">Моя новая реакция</h1>
      <RadioGroup aria-label="Новая реакция" value={journey.reactionId??''} onValueChange={reactionId=>{const reaction=reactions.find(item=>item.id===reactionId);if(reaction)update({reactionId,replay:reaction.text,manifestation:reaction.kind==='integrated'?'integrated':'shadow'});}}>{reactions.map(item=><label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={item.id} className="mt-1 shrink-0"/><span className="leading-relaxed">{item.text}</span></label>)}</RadioGroup>{next('Далее','feelings')}
    </>}
    {step==='feelings'&&<>
      <PracticeFeelings value={journey.afterFeelings??[]} onChange={afterFeelings=>update({afterFeelings,after:afterFeelings.join(', ')})}/>
      <PracticeRating phase="после" question="Насколько ты теперь готова проявлять это качество?" value={journey.shadeAfter?.mode==='scale'?journey.shadeAfter.rating:undefined} onChange={rating=>update({shadeAfter:{mode:'scale',rating}})}/>
      {next('Ресурс и маленький шаг','resource')}
    </>}
    {step==='resource'&&<>
      <h1 className="text-4xl font-semibold">Ресурс</h1><p className="leading-relaxed">{support.resource}</p><h2 className="text-3xl">Маленький шаг</h2><p className="leading-relaxed">{support.smallStep}</p>
      <ShadeComparison before={journey.shadeBefore} after={journey.shadeAfter}/>
      <Btn onClick={()=>{const entry=finishJourney(answer,{...journey,...support,step:'resource'},card,day,theme,shadeId);if(entry)onComplete(entry);}}>ИТОГ</Btn>
    </>}
    {index>0&&<Btn variant="ghost" onClick={()=>{const previous=steps[index-1];if(previous)go(previous);}}>Назад</Btn>}
  </div>;
}
