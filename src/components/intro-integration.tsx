import { Btn } from '@/components/game-ui';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { canContinueIntegration, emptyIntegration, integrationProfile, integrationReactions, type IntroIntegration as Integration } from '@/lib/intro-integration';

export function IntroIntegration({value,selected,scenario,before,onChange,onBack}: {value:Integration;selected:string[];scenario:string;before:string[];onChange:(value:Integration)=>void;onBack:()=>void}) {
  const profile = integrationProfile(value.quality);
  if (!profile) return null;
  const reactions = integrationReactions(value.quality);
  const reaction = reactions.find(item => item.id === value.reactionId);
  const update = (changes:Partial<Integration>) => onChange({...value,...changes});
  const go = (step:Integration['step']) => {update({step});window.scrollTo(0,0);};
  const field = (key:'meaning'|'where'|'afraid'|'personalReaction'|'after'|'balance'|'resource'|'smallStep',label:string) => <label className="block space-y-3"><span className="font-semibold">{label}</span><textarea aria-label={label} value={value[key]} onChange={e=>update({[key]:e.target.value})} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold" /></label>;
  const next = (label:string,step:Integration['step']) => <Btn disabled={!canContinueIntegration(value)} onClick={()=>go(step)}>{label}</Btn>;
  return <div className="space-y-6">
    <h2 className="text-3xl font-semibold">Интегрировать тень</h2>
    <h3 className="text-3xl text-gold">{profile.name}</h3>
    {value.step === 'meaning' && <>
      <p className="text-sm text-muted-foreground">Это одно из качеств, которые ты сама выбрала. Образ для пробы, а не вывод о тебе.</p>
      {selected.filter(item=>integrationProfile(item)).length > 1 && <RadioGroup aria-label="Качество для интеграции" value={value.quality} onValueChange={quality=>onChange(emptyIntegration(quality))}>{selected.filter(item=>integrationProfile(item)).map(item=><label key={item} className="flex items-center gap-3 rounded-lg border border-border p-3"><RadioGroupItem value={item}/>{item}</label>)}</RadioGroup>}
      <section className="border-l-2 border-gold pl-4"><h4 className="text-2xl font-semibold">Теневое проявление</h4><p className="mt-2 leading-relaxed">{profile.shadow}</p></section>
      <section className="border-l-2 border-gold pl-4"><h4 className="text-2xl font-semibold">Интегрированное проявление</h4><p className="mt-2 leading-relaxed">{profile.integrated}</p></section>
      <p className="leading-relaxed">Интегрировать — взять силу качества, сохраняя свои и чужие границы, а не разрешить себе ранить другого.</p>
      {field('meaning',`Что для тебя «${profile.name}»?`)}
      {field('where','Где и как ты проявляешь это качество?')}
      {field('afraid','Где ты боишься проявить это качество?')}
      {next('Выбрать новую реакцию','reaction')}
    </>}
    {value.step === 'reaction' && <>
      <h3 className="text-2xl font-semibold">Моя новая реакция</h3><p className="whitespace-pre-line border-l-2 border-gold pl-4 leading-relaxed">{scenario}</p>
      <p className="leading-relaxed">Как ты ответишь, если позволишь себе силу этого качества? Можно выбрать и привычную реакцию — это проба, не экзамен.</p>
      <p className="border-l-2 border-gold pl-4 leading-relaxed">{profile.integrated}</p>
      <RadioGroup aria-label="Новая реакция" value={value.reactionId} onValueChange={reactionId=>update({reactionId})}>{reactions.map(item=><label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 has-[[data-state=checked]]:border-gold"><RadioGroupItem value={item.id} className="mt-1 shrink-0"/><span className="leading-relaxed">{item.text}</span></label>)}</RadioGroup>
      {reaction && <p className="text-sm leading-relaxed text-muted-foreground">{reaction.feedback}</p>}
      {field('personalReaction','Моя реакция своими словами — по желанию')}
      {field('after','Что ты чувствуешь после этой пробы?')}
      {next('Найти баланс','balance')}<Btn variant="ghost" onClick={()=>go('meaning')}>К качеству</Btn>
    </>}
    {value.step === 'balance' && <>
      <h3 className="text-2xl font-semibold">Внедрение и поиск баланса</h3><p className="leading-relaxed">{profile.integrated}</p>
      {field('balance','Как ты используешь это качество, сохраняя свои и чужие границы?')}
      <p className="leading-relaxed">В живой или онлайн-игре можно отыграть эту ситуацию с человеком и получить обратную связь. При угрозе важнее безопасность и поддержка.</p>
      {next('Забрать ресурс','resource')}<Btn variant="ghost" onClick={()=>go('reaction')}>К новой реакции</Btn>
    </>}
    {value.step === 'resource' && <>
      <h3 className="text-2xl font-semibold">Ресурс и маленький шаг</h3>
      {field('resource','Какой ресурс ты забираешь из этой пробы?')}
      {field('smallStep','Какой маленький шаг ты сделаешь?')}
      {next('Итог интеграции','summary')}<Btn variant="ghost" onClick={()=>go('balance')}>К балансу</Btn>
    </>}
    {value.step === 'summary' && <>
      <h3 className="text-2xl font-semibold">Итог интеграции</h3>
      <p className="leading-relaxed">{profile.integrated}</p>
      <section><h4 className="text-2xl">Моя новая реакция</h4><p className="mt-2 leading-relaxed">{reaction?.text}</p>{value.personalReaction && <p className="mt-2 whitespace-pre-line">{value.personalReaction}</p>}</section>
      <div className="grid grid-cols-2 gap-4"><section><h4 className="text-xl text-gold">Чувства до</h4><p className="mt-2">{before.join(', ')}</p></section><section><h4 className="text-xl text-gold">Чувства после</h4><p className="mt-2 whitespace-pre-line break-words">{value.after}</p></section></div>
      {(['balance','resource','smallStep'] as const).map((key,index)=><section key={key}><h4 className="text-2xl">{['Баланс','Ресурс','Маленький шаг'][index]}</h4><p className="mt-2 whitespace-pre-line break-words">{value[key]}</p></section>)}
      <Btn onClick={onBack}>К итогу первой карты</Btn><Btn variant="ghost" onClick={()=>go('reaction')}>Попробовать другую реакцию</Btn>
    </>}
    {value.step !== 'summary' && <Btn variant="ghost" onClick={onBack}>К итогу первой карты</Btn>}
  </div>;
}