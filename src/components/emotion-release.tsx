import { useEffect, useRef, useState } from 'react';
import { TreePine, Mountain, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Btn } from '@/components/game-ui';
import type { IntroDay } from '@/lib/intro-day';
import forest from '@/assets/release-forest.jpg';
import mountain from '@/assets/release-mountain.jpg';
import sea from '@/assets/release-sea.jpg';

const places = [
  {id: 'forest', label: 'Лес', image: forest, Icon: TreePine},
  {id: 'mountain', label: 'Гора', image: mountain, Icon: Mountain},
  // Preserve the legacy stored ID so existing sessions remain compatible.
  {id: 'toilet', label: 'Море', image: sea, Icon: Waves},
] as const;

export function EmotionRelease({day, situation, onMethod, onDone, disabled = false}: {
  day: IntroDay; situation: string; onMethod: (method: IntroDay['release_method']) => void;
  onDone: () => void; disabled?: boolean;
}) {
  const [writing, setWriting] = useState('');
  const [releasing, setReleasing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const done = useRef(onDone); done.current = onDone;
  useEffect(() => () => clearTimeout(timer.current), []);
  const place = places.find(item => item.id === day.release_method) ?? places[0];
  return <div className="relative isolate space-y-5">
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <img src={place.image} alt="" width={1024} height={1536} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-night/80" />
    </div>
    <h1 className="text-3xl font-semibold">Отпустить эмоции</h1>
    <p className="leading-relaxed">Прочти ещё раз ситуацию. Погрузи туда своего персонажа и попробуй отпустить эмоциональное напряжение.</p>
    <p className="leading-relaxed">Эмоции могут ослабевать со временем, но у них нет единого срока — даже 12 минут не гарантируют, что переживание пройдёт. Пауза помогает заметить автоматические, неосознанные реакции и выбрать, как действовать. Учись управлять своей реакцией, чтобы эмоции не управляли тобой. Не нужно подавлять чувства или торопить себя.</p>
    <p className="whitespace-pre-wrap border-l-2 border-gold pl-4 leading-relaxed">{situation}</p>
    <div className="grid grid-cols-3 gap-2">{places.map(({id, label, Icon}) => <Button key={id} variant="outline" disabled={releasing || disabled} aria-pressed={place.id === id} className={`h-auto flex-col gap-2 py-3 ${place.id === id ? 'border-gold bg-primary text-primary-foreground' : 'bg-card'}`} onClick={() => onMethod(id)}><Icon className="size-5" />{label}</Button>)}</div>
    <p>{day.chosen_feelings.length ? `Ты назвала: ${day.chosen_feelings.join(', ')}. ` : ''}Представь, как отпускаешь напряжение в лесу, с вершины горы или с морской волной. Можно выразить всё письменно — этот текст исчезнет и не сохранится.</p>
    {day.chosen_qualities.length > 0 && <p>В партнёре задели: {day.chosen_qualities.join(', ')}.</p>}
    {day.chosen_shadows.length > 0 && <p>Персонаж не позволяет себе быть: {day.chosen_shadows.join(', ')}.</p>}
    <p>Отпускай напряжение здесь, а не выговаривай его партнёру. Мы не избавляемся от качеств — освобождаем место для спокойного, конструктивного диалога.</p>
    {releasing ? <p role="status" className="min-h-40 whitespace-pre-wrap break-words border-l-2 border-gold pl-4 motion-safe:animate-pulse">{writing || 'Отпускаем эмоции…'}</p> : <Textarea aria-label="Письменный выпуск эмоций" value={writing} onChange={event => setWriting(event.target.value)} placeholder="Выпусти здесь всё, что накопилось…" className="min-h-40 bg-card/90" />}
    <Btn disabled={releasing || disabled} onClick={() => {if (!day.release_method) onMethod('forest'); setReleasing(true); timer.current = setTimeout(() => {setWriting(''); setReleasing(false); done.current();}, 3000);}}>Отпустить эмоции</Btn>
    <Btn variant="ghost" disabled={releasing || disabled} onClick={() => {setWriting(''); onDone();}}>Эмоций нет, идём дальше</Btn>
  </div>;
}