import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { PRACTICE_FEELINGS } from '@/lib/integration-practice';

export function PracticeFeelings({value,onChange}:{value:string[];onChange:(value:string[])=>void}) {
  return <fieldset className="space-y-4"><legend className="mb-4 text-2xl font-semibold">Что ты чувствуешь?</legend><div className="grid grid-cols-2 gap-2">{PRACTICE_FEELINGS.map(feeling=><label key={feeling} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-gold"><Checkbox aria-label={feeling} checked={value.includes(feeling)} onCheckedChange={checked=>onChange(checked ? [...value,feeling] : value.filter(item=>item!==feeling))}/><span className="min-w-0 text-sm">{feeling}</span></label>)}</div></fieldset>;
}
export function PracticeRating({question,value,onChange,phase='до'}:{question:string;value?:number | undefined;onChange:(value:number)=>void;phase?:string}) {
  return <section className="space-y-4"><h3 className="text-2xl font-semibold">{question}</h3><p className="text-center text-3xl text-gold">{value === undefined ? '—' : value} / 10</p><Slider aria-label={`Оценка качества ${phase}`} min={1} max={10} step={1} value={[value ?? 5]} onValueChange={values=>{const rating=values[0];if(rating!==undefined)onChange(rating);}}/><div className="flex justify-between gap-4 text-sm text-muted-foreground"><span>1 · Почти не проявляю</span><span className="text-right">10 · Часто проявляю</span></div></section>;
}