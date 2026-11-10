import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { shadeRatingChange, type ShadeAssessment as Assessment } from '@/lib/challenge-journey';

export function ShadeAssessment({phase,name,value,onChange}: {phase:'before'|'after';name:string;value?:Assessment | undefined;onChange:(value:Assessment)=>void}) {
  const title = phase === 'before' ? 'До знакомства с интегрированной тенью' : 'После знакомства с интегрированной тенью';
  return <section className="space-y-4 border-t border-border pt-6">
    <h3 className="text-2xl font-semibold">{title}</h3>
    <p className="leading-relaxed">Насколько ты сейчас можешь использовать «{name}» как силу, не раня себя и других?</p>
    <RadioGroup aria-label={`Формат оценки ${phase === 'before' ? 'до' : 'после'}`} value={value?.mode ?? ''} onValueChange={mode => {if(mode === 'scale') onChange({mode,rating:5}); if(mode === 'words') onChange({mode,text:''});}} className="grid grid-cols-2 gap-3">
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3"><RadioGroupItem value="scale" /><span>Шкала 1–10</span></label>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3"><RadioGroupItem value="words" /><span>Своими словами</span></label>
    </RadioGroup>
    {value?.mode === 'scale' && <div className="space-y-4 py-2"><p className="text-center font-display text-3xl text-gold">{value.rating} / 10</p><Slider aria-label={`Оценка тени ${phase === 'before' ? 'до' : 'после'}`} min={1} max={10} step={1} value={[value.rating]} onValueChange={values => {const rating=values[0];if(rating !== undefined) onChange({mode:'scale',rating});}} /><div className="flex justify-between gap-5 text-sm text-muted-foreground"><span>1 · Пока трудно</span><span className="text-right">10 · Чувствую опору</span></div></div>}
    {value?.mode === 'words' && <textarea aria-label={`Моё отношение к тени ${phase === 'before' ? 'до' : 'после'}`} value={value.text} onChange={event => onChange({mode:'words',text:event.target.value})} className="min-h-28 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold" />}
  </section>;
}

export function ShadeComparison({before,after}: {before?:Assessment | undefined;after?:Assessment | undefined}) {
  if (!before && !after) return null;
  const change = shadeRatingChange(before,after);
  const text = (value?:Assessment) => value?.mode === 'scale' ? `${value.rating} / 10` : value?.text ?? 'Пока нет ответа';
  return <section className="space-y-4 border-t border-border pt-6"><h3 className="text-2xl font-semibold">Моё отношение к оттенку: до и после</h3><p className="text-sm text-muted-foreground">Могу ли я использовать это качество как силу, не раня себя и других?</p><div className="grid grid-cols-2 gap-4"><div><h4 className="font-semibold text-gold">До</h4><p className="mt-2 whitespace-pre-line break-words">{text(before)}</p></div><div><h4 className="font-semibold text-gold">После</h4><p className="mt-2 whitespace-pre-line break-words">{text(after)}</p></div></div>{change !== null && <p>Изменение: {change > 0 ? '+' : ''}{change} {Math.abs(change) === 1 ? 'балл' : Math.abs(change) >= 2 && Math.abs(change) <= 4 ? 'балла' : 'баллов'}</p>}<p className="text-sm text-muted-foreground">Это твоя оценка в этот момент, не диагноз. Любое изменение — повод прислушаться к себе.</p></section>;
}