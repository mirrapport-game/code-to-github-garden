import { useRef, useState } from 'react';
import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LEVEL_META, type GameCard, type LevelKey } from '@/lib/cards';
import type { ChallengeAnswer } from '@/lib/challenge-store';
import { canContinueJourney, emptyJourney, finishJourney, type JourneyDraft, type JourneyStep } from '@/lib/challenge-journey';
import { CHALLENGE_QUALITIES, CHALLENGE_SPHERES, QUALITIES_MAX, QUALITIES_MIN, SEED_ACTIONS, SEED_GOODS } from '@/lib/challenge-reflection';
import { ComingSoonButton } from '@/components/coming-soon-button';
import { SHADOW_SHADES } from '@/lib/shadow-shades';
import { SHADE_IMAGES } from '@/lib/shadow-shade-images';
import cover from '@/assets/shadow-shades-cover.jpg';
import { ChallengeStory } from '@/components/challenge-story';
import { practiceSupport } from '@/lib/integration-practice';
import { PracticeChoices, PracticeFeelings } from '@/components/practice-controls';

const split=(value:string)=>value.split(', ').map(item=>item.trim()).filter(Boolean);

export function ChallengeJourney({day,card,theme,shadeId,draft,requestText,onDraft,onComplete}: {day:number;card:GameCard;theme:string;shadeId?:string | undefined;requestText?:string | undefined;draft?:Partial<ChallengeAnswer> | undefined;onDraft:(answer:Partial<ChallengeAnswer>)=>void;onComplete:(answer:ChallengeAnswer)=>void}) {
  const [answer,setAnswer]=useState<Partial<ChallengeAnswer>>(draft??{});
  const answerRef=useRef(answer);
  const journey={...emptyJourney(),...answer.journey,practiceMode:'reflection' as const};
  const step=['balance','resource'].includes(journey.step) ? 'feelings' : journey.step==='request' && !requestText ? 'feelings' : journey.step;
  const shade=SHADOW_SHADES.find(item=>item.id===shadeId);
  const image=shade?SHADE_IMAGES[shade.id]:undefined;
  const name=shade?.name??theme;
  const integrated=image?.integrated??shade?.integrated??'Обозначать свои потребности, уважая свои и чужие границы.';
  const support=practiceSupport(name,integrated);
  const update=(changes:Partial<JourneyDraft>,extra:Partial<ChallengeAnswer>={})=>{const value={...answerRef.current,...extra,journey:{...emptyJourney(),...answerRef.current.journey,...changes,practiceMode:'reflection' as const}};answerRef.current=value;setAnswer(value);onDraft(value);};
  const go=(target:JourneyStep)=>{update({step:target,...(target==='resource'?support:{}),...(target==='request' && requestText ? {requestText} : {})});window.scrollTo(0,0);};
  const next=(label:string,target:JourneyStep)=><Btn disabled={!canContinueJourney(step,journey,answer.level)} onClick={()=>go(target)}>{label}</Btn>;
  const scenario=answer.level?card.levels[answer.level].text:card.context;
  const steps:JourneyStep[]=['story','scenario','reflection','shadeMeaning','shadeView','shadePlay','feelings',...(requestText ? ['request' as const] : [])];
  const finish=()=>{const entry=finishJourney(answer,{...journey,...support},card,day,theme,shadeId,requestText);if(entry)onComplete(entry);};
  const index=steps.indexOf(step);
  if(step==='story')return <ChallengeStory day={day} completeLabel="К сегодняшней карте" onComplete={()=>go('scenario')}/>;
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">День {day} / 7 · Знакомство с игрой</p><p className="text-sm text-muted-foreground">Шаг {index+1} из {steps.length}</p>
    {step==='scenario'&&<>
      <h1 className="text-4xl font-semibold">{card.stage}</h1>
      <p className="leading-relaxed">Сейчас ты познакомишься с ситуацией из игры. Прочитай её и представь себя на месте героини: что тебя в ней задевает? Где ты узнаёшь себя? Пока просто замечай свой отклик — к чувствам и ответам перейдём дальше.</p>
      <img src={card.cover} alt={`Карта «${card.stage}»`} className="gold-frame mx-auto aspect-[2/3] w-full max-w-64 rounded-lg object-contain shadow-card"/>
      <h2 className="text-3xl font-semibold">{card.scenario}</h2><p className="whitespace-pre-line leading-relaxed">{card.context}</p><h3 className="text-2xl">Выбери степень жёсткости партнёра</h3>
      <p className="leading-relaxed">Партнёр — это другой человек в ситуации. Мягкая, средняя или жёсткая: выбери, насколько напряжённым будет ваше взаимодействие сегодня. Затем прочитай выбранный вариант. Начни с того уровня, с которым тебе комфортно; его можно изменить.</p>
      <RadioGroup aria-label="Сила ситуации" value={answer.level??''} onValueChange={level=>{if(level==='soft'||level==='medium'||level==='hard')update({firstDialogue:[],firstDialogueComplete:false,firstReactionId:'',firstReactionText:''},{level});}}>{(Object.keys(LEVEL_META) as LevelKey[]).map(key=><label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={key} className="mt-1"/><span><span className={LEVEL_META[key].text}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</span><span className="block font-display text-xl">{card.levels[key].title}</span></span></label>)}</RadioGroup>
      {answer.level&&<p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>}
      {next('К чувствам и качествам','reflection')}
    </>}
    {step==='reflection'&&<>
      <h1 className="text-4xl font-semibold">Рефлексия</h1><p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>
      <p className="leading-relaxed">Вернись к ситуации и замечай, что она вызывает в тебе. Выбери чувства и качества из списков — здесь нет правильных ответов, важен твой взгляд.</p>
      <PracticeFeelings value={split(journey.before)} onChange={feelings=>update({before:feelings.join(', ')})}/>
      <PracticeChoices legend="Какие качества в другом человеке тебе трудно принять?" hint={`Выбери от ${QUALITIES_MIN} до ${QUALITIES_MAX} качеств.`} options={CHALLENGE_QUALITIES} value={split(journey.rejected)} onChange={qualities=>update({rejected:qualities.join(', ')})} min={QUALITIES_MIN} max={QUALITIES_MAX}/>
      <PracticeChoices legend="Где ещё тебе сложно проявлять эти качества?" hint={split(journey.rejected).length?`Речь о качествах: ${split(journey.rejected).join(', ')}.`:'Сначала выбери качества выше.'} options={CHALLENGE_SPHERES} value={split(journey.recognition)} onChange={spheres=>update({recognition:spheres.join(', ')})}/>
      {next('Далее','shadeMeaning')}
    </>}
    {step==='shadeMeaning'&&<>
      <h1 className="text-4xl font-semibold">Оттенки тени</h1><h2 className="text-3xl text-gold">{name}</h2><p className="text-sm text-muted-foreground">Случайная карта — образ для пробы, а не вывод о тебе.</p>
      <p className="leading-relaxed">Теперь познакомься с одним качеством. Вспомни, где ты позволяешь его себе, а где сдерживаешь, — выбери сферы из списка. Затем посмотрим на него с другой стороны.</p>
      <PracticeChoices legend="Где ты проявляешь это качество?" options={CHALLENGE_SPHERES} value={split(journey.where)} onChange={spheres=>update({where:spheres.join(', ')})}/>
      <PracticeChoices legend="Где боишься проявлять?" options={CHALLENGE_SPHERES} value={split(journey.afraid)} onChange={spheres=>update({afraid:spheres.join(', ')})}/>
      {next('Посмотреть с другой стороны','shadeView')}
    </>}
    {step==='shadeView'&&<>
      <h1 className="text-4xl font-semibold">Посмотри на оттенок тени с другой стороны</h1><h2 className="text-3xl text-gold">{name}</h2><img src={cover} alt="Оттенки тени" className="gold-frame mx-auto aspect-[2/3] w-full max-w-56 rounded-lg object-contain shadow-card"/>
      <section className="border-l-2 border-gold pl-4"><h3 className="text-2xl">Теневое проявление</h3><p className="mt-2 leading-relaxed">{image?.shadow??shade?.shadow}</p></section>
      <section className="border-l-2 border-gold pl-4"><h3 className="text-2xl">Интегрированное проявление</h3><p className="mt-2 leading-relaxed">{integrated}</p></section>
      <p className="leading-relaxed">Примерь интегрированное проявление этого качества, сохраняя свои и чужие границы.</p>{next('Интегрировать тень','shadePlay')}
    </>}
    {step==='shadePlay'&&<>
      <h1 className="text-4xl font-semibold">Интеграция тени</h1>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>
      <section className="border-l-2 border-gold pl-4"><h3 className="text-2xl">Интегрированная тень · {name}</h3><p className="mt-2 leading-relaxed">{integrated}</p></section>
      <p className="leading-relaxed">Представь, как ты могла бы проявить силу этого качества в ситуации на карте. Что тебе ближе сейчас?</p>
      <RadioGroup aria-label="Проявление качества" value={journey.manifestation} onValueChange={value=>{if(value==='shadow'||value==='integrated'||value==='neither')update({manifestation:value});}}>
        {([['shadow','Пока узнаю себя в теневом проявлении'],['integrated','Готова попробовать интегрированное проявление'],['neither','Пока ни одно проявление мне не близко']] as const).map(([value,label])=><label key={value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={value} className="mt-1"/><span>{label}</span></label>)}
      </RadioGroup>
      {next('Далее','feelings')}
    </>}
    {step==='feelings'&&<>
      <PracticeFeelings value={journey.afterFeelings??[]} onChange={afterFeelings=>update({afterFeelings,after:afterFeelings.join(', ')})}/>
      {requestText ? next('Вернуться к запросу','request') : <Btn disabled={!canContinueJourney('feelings',journey)} onClick={finish}>Закончить день</Btn>}
    </>}
    {step==='request' && requestText && <>
      <h1 className="text-4xl font-semibold">Вернись к своему запросу</h1><h2 className="text-2xl">Мой запрос</h2><p className="whitespace-pre-line break-words border-l-2 border-gold pl-4 leading-relaxed">{requestText}</p>
      <label className="block space-y-3"><span className="text-2xl font-semibold">Как это связано с твоим запросом?</span><textarea aria-label="Как это связано с твоим запросом?" autoComplete="off" value={journey.requestReflection ?? ''} onChange={event=>update({requestText,requestReflection:event.target.value})} className="min-h-32 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold"/></label>
      <Btn disabled={!journey.requestReflection?.trim()} onClick={finish}>Закончить день</Btn>
    </>}
    {step==='resource'&&<>
      <h1 className="text-4xl font-semibold">Присматриваться к лучшему и сеять новое</h1>
      <p className="leading-relaxed">В конце дня заметь, что уже получилось, и выбери одно маленькое действие — семя, которое ты посеешь на этой неделе.</p>
      <PracticeChoices legend="Что хорошего ты заметила в себе сегодня?" hint="Выбери от 1 до 3 пунктов." options={SEED_GOODS} value={journey.seedGood??[]} onChange={seedGood=>update({seedGood})} min={1} max={3}/>
      <PracticeChoices legend="Какое новое действие посеешь?" hint="Выбери одно маленькое действие." options={SEED_ACTIONS} value={journey.seedAction?[journey.seedAction]:[]} onChange={actions=>update({seedAction:actions[actions.length-1] ?? ''})} max={1}/>
      <h2 className="text-3xl font-semibold">Ресурс</h2><p className="leading-relaxed">{support.resource}</p><h3 className="text-2xl">Маленький шаг</h3><p className="leading-relaxed">{support.smallStep}</p>
      <ComingSoonButton hint="Итог откроется позже">ИТОГ</ComingSoonButton>
      <Btn variant="ghost" disabled={!canContinueJourney('resource',{...journey,...support}) || Boolean(requestText && !journey.requestReflection?.trim())} onClick={()=>{const entry=finishJourney(answer,{...journey,...support,step:'resource'},card,day,theme,shadeId,requestText);if(entry)onComplete(entry);}}>Сохранить день {day}</Btn>
    </>}
    {index>0&&<Btn variant="ghost" onClick={()=>{const previous=steps[index-1];if(previous)go(previous);}}>Назад</Btn>}
  </div>;
}
