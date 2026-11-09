import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { PRACTICES } from '@/lib/challenge';
import { DEMO_CARDS } from '@/lib/demo-cards';
import { LEVEL_META, type LevelKey } from '@/lib/cards';
import { THEME_REFLECTIONS } from '@/lib/theme-reflection';
import { DayReflection } from '@/components/day-reflection';

export function ChallengePreview({ day, onClose }: { day: number; onClose: () => void }) {
  const [stage, setStage] = useState('Слабость');
  const [level, setLevel] = useState<LevelKey>('soft');
  const practice = PRACTICES[day - 1];
  const card = DEMO_CARDS.find(item => item.stage === stage);
  const theme = THEME_REFLECTIONS[stage];
  if (!practice || !card || !theme) return null;
  return <div className="space-y-6">
    <p className="text-sm uppercase text-gold">Просмотр · День {day} / 7</p>
    <h1 className="text-4xl font-semibold">{practice.title}</h1>
    <p className="text-sm text-muted-foreground">Просмотр не записывает ответы и не засчитывает день.</p>
    <label className="block space-y-2 font-semibold">Тема карты<select aria-label="Тема карты" value={stage} onChange={e => setStage(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3 font-normal">{DEMO_CARDS.map(item => <option key={item.stage}>{item.stage}</option>)}</select></label>
    <img src={card.cover} alt="Общая фотография колоды Раппорт: ЖиваЯ" className="aspect-[4/3] w-full rounded-lg object-cover" />
    <p className="text-xs text-muted-foreground">Демо-сценарий · общая фотография колоды</p>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">{card.scenario}</h2><p>{card.context}</p><div className="flex gap-2">{(Object.keys(LEVEL_META) as LevelKey[]).map(key => <Btn key={key} variant={level === key ? 'night' : 'ghost'} className="px-2" onClick={() => setLevel(key)}>{LEVEL_META[key].icon} {LEVEL_META[key].label}</Btn>)}</div><p>{card.levels[level].text}</p></section>
    <section className="border-y border-border py-5"><h2 className="text-2xl font-semibold">Практика дня</h2><p className="mt-3">{practice.concept}</p></section>
    <section><h2 className="text-2xl font-semibold">Вопросы о себе</h2><ol className="mt-4 list-decimal space-y-3 pl-5">{[...theme.questions, 'Что ты чувствуешь и где в теле отклик?', 'Что именно задевает: фраза, жест, действие?', 'Что ты не разрешаешь себе в этой ситуации?', 'Что бы ты ответила подруге?', ...practice.questions].map(question => <li key={question}>{question}</li>)}</ol></section>
    <DayReflection stage={stage} answer={{}} />
    <Btn onClick={onClose}>К семи дням</Btn>
  </div>;
}