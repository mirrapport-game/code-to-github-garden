import { Checkbox } from '@/components/ui/checkbox';
import { emptyIntroReflection, INTRO_FEELINGS, INTRO_QUALITIES, INTRO_SPHERES } from '@/lib/intro-choices';
import type { ChallengeAnswer } from '@/lib/challenge-store';

function Selection({label,items,value,onChange}: {label:string;items:string[];value:string[];onChange:(value:string[])=>void}) {
  return <fieldset className="space-y-3"><legend className="mb-3 text-2xl font-semibold">{label}</legend>
    <div className="grid grid-cols-2 gap-2">{items.map(item => <label key={item} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold"><Checkbox aria-label={item} checked={value.includes(item)} onCheckedChange={checked => onChange(checked ? [...value,item] : value.filter(entry => entry !== item))} /><span className="min-w-0 text-sm leading-relaxed">{item}</span></label>)}</div>
  </fieldset>;
}

export function IntroReflection({answer,onChange}: {answer:Partial<ChallengeAnswer>;onChange:(answer:Partial<ChallengeAnswer>)=>void}) {
  const reflection = {...emptyIntroReflection(),...answer.introReflection};
  const update = (changes: Partial<typeof reflection>) => {
    const next = {...reflection,...changes};
    onChange({introReflection:next,hurt:next.qualities.join(', '),shadow:next.notAllowed.join(', ')});
  };
  return <div className="space-y-7">
    <Selection label="Что чувствуешь?" items={INTRO_FEELINGS} value={answer.feelings ?? []} onChange={feelings => onChange({feelings})} />
    <Selection label="Какие качества тебе трудно принять?" items={INTRO_QUALITIES} value={reflection.qualities} onChange={qualities => update({qualities})} />
    <Selection label="Какой себе не позволяешь быть?" items={INTRO_QUALITIES} value={reflection.notAllowed} onChange={notAllowed => update({notAllowed})} />
    <Selection label="Где ещё встречается?" items={INTRO_SPHERES} value={reflection.spheres} onChange={spheres => update({spheres})} />
    <label className="block space-y-3"><span className="text-2xl font-semibold">В чём сила этих качеств?</span><textarea aria-label="В чём сила этих качеств?" value={reflection.strength} onChange={event => update({strength:event.target.value})} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold" /></label>
  </div>;
}