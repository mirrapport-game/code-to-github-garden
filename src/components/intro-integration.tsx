import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { canContinueIntegration, emptyIntegration, integrationProfile, type IntroIntegration as Integration } from '@/lib/intro-integration';
import { practiceRatingQuestion, practiceSupport } from '@/lib/integration-practice';
import { PracticeFeelings, PracticeRating } from '@/components/practice-controls';
import { PracticeChoices } from '@/components/practice-controls';
import { CHALLENGE_SPHERES, scenarioReactions } from '@/lib/challenge-reflection';
import type { GameCard, LevelKey } from '@/lib/cards';

export function IntroIntegration({value,selected,before,card,theme,level,onChange,onBack}: {value:Integration;selected:string[];scenario:string;card:GameCard;theme:string;level?:LevelKey | undefined;before:string[];onChange:(value:Integration)=>void;onBack:()=>void}) {
  const profile=integrationProfile(value.quality);
  if(!profile)return null;
  const reactions=scenarioReactions(card,profile.name,profile.integrated,theme,level);
  const reaction=reactions.find(item=>item.id===value.reactionId);
  const support=practiceSupport(profile.name,profile.integrated);
  const step=value.step==='balance' ? 'feelings' : value.step;
  const update=(changes:Partial<Integration>)=>onChange({...value,...changes});
  const go=(target:Integration['step'])=>{update({step:target,...(target==='resource'?support:{})});window.scrollTo(0,0);};
  const field=(key:'where'|'afraid',label:string)=><PracticeChoices legend={label} options={CHALLENGE_SPHERES} value={value[key].split(', ').filter(Boolean)} onChange={items=>update({[key]:items.join(', ')})}/>;
  const next=(label:string,target:Integration['step'])=><Btn disabled={!canContinueIntegration({...value,step})} onClick={()=>go(target)}>{label}</Btn>;
  const back:Record<string,Integration['step']>={manifestations:'meaning',reaction:'manifestations',feelings:'reaction',resource:'feelings',summary:'resource'};
  return <div className="space-y-6">
    <h2 className="text-3xl font-semibold text-gold">{profile.name}</h2>
    {step==='meaning'&&<>
      {selected.filter(item=>integrationProfile(item)).length>1&&<RadioGroup aria-label="Качество для интеграции" value={value.quality} onValueChange={quality=>onChange(emptyIntegration(quality))}>{selected.filter(item=>integrationProfile(item)).map(item=><label key={item} className="flex items-center gap-3 rounded-lg border border-border p-3"><RadioGroupItem value={item}/>{integrationProfile(item)?.name}</label>)}</RadioGroup>}
      <PracticeRating question={practiceRatingQuestion(profile.name,value.quality)} value={value.ratingBefore} onChange={ratingBefore=>update({ratingBefore})}/>
      {field('where','Где ты проявляешь это качество?')}
      {field('afraid','Где боишься проявлять?')}
      {next('Посмотреть с другой стороны','manifestations')}
    </>}
    {step==='manifestations'&&<>
      <h3 className="text-2xl font-semibold">Посмотри на тень с другой стороны</h3>
      <section className="border-l-2 border-gold pl-4"><h4 className="text-2xl">Теневое проявление</h4><p className="mt-2 leading-relaxed">{profile.shadow}</p></section>
      <section className="border-l-2 border-gold pl-4"><h4 className="text-2xl">Интегрированное проявление</h4><p className="mt-2 leading-relaxed">{profile.integrated}</p></section>
      <p className="leading-relaxed">Попробуй интегрировать тень: взять силу качества, сохраняя свои и чужие границы, и выбрать новую реакцию.</p>
      {next('Выбрать новую реакцию','reaction')}
    </>}
    {step==='reaction'&&<>
      <h3 className="text-2xl font-semibold">Моя новая реакция</h3>
      <RadioGroup aria-label="Новая реакция" value={value.reactionId} onValueChange={reactionId=>update({reactionId})}>{reactions.map(item=><label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={item.id} className="mt-1 shrink-0"/><span className="leading-relaxed">{item.text}</span></label>)}</RadioGroup>
      {reaction&&<p className="border-l-2 border-gold pl-4 leading-relaxed">{reaction.feedback}</p>}
      {next('Далее','feelings')}
    </>}
    {step==='feelings'&&<>
      <PracticeFeelings value={value.afterFeelings??[]} onChange={afterFeelings=>update({afterFeelings,after:afterFeelings.join(', ')})}/>
      <PracticeRating phase="после" question="Насколько ты теперь готова проявлять это качество?" value={value.ratingAfter} onChange={ratingAfter=>update({ratingAfter})}/>
      {next('Ресурс и маленький шаг','resource')}
    </>}
    {step==='resource'&&<>
      <h3 className="text-2xl font-semibold">Ресурс</h3><p className="leading-relaxed">{support.resource}</p>
      <h3 className="text-2xl font-semibold">Маленький шаг</h3><p className="leading-relaxed">{support.smallStep}</p>
      <Btn onClick={()=>{update({...support,step:'summary'});window.scrollTo(0,0);}}>Итог интеграции</Btn>
    </>}
    {step==='summary'&&<>
      <h3 className="text-2xl font-semibold">Итог интеграции</h3>
      <section><h4 className="text-xl">Моя новая реакция</h4><p className="mt-2 leading-relaxed">{reaction?.text}</p></section>
      <div className="grid grid-cols-2 gap-4"><section><h4 className="text-xl text-gold">Чувства до</h4><p className="mt-2">{before.join(', ')}</p></section><section><h4 className="text-xl text-gold">Чувства после</h4><p className="mt-2">{value.after}</p></section></div>
      {value.ratingBefore!==undefined&&value.ratingAfter!==undefined&&<p>Оценка качества: {value.ratingBefore} → {value.ratingAfter} из 10</p>}
      <h4 className="text-2xl">Ресурс</h4><p className="leading-relaxed">{value.resource}</p><h4 className="text-2xl">Маленький шаг</h4><p className="leading-relaxed">{value.smallStep}</p>
      <Btn onClick={onBack}>К итогу первой карты</Btn>
    </>}
    <Btn variant="ghost" onClick={()=>{const target=back[step];if(target)go(target);else onBack();}}>Назад</Btn>
  </div>;
}
