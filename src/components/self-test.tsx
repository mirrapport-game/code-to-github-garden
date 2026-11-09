import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { TEST_GROUPS, TEST_QUESTIONS, scoreTest, profileBand } from '@/lib/self-test';

const SCALE = ['совсем не про меня', 'скорее не про меня', 'иногда так, иногда нет', 'скорее про меня', 'очень про меня'];
export function SelfTest({ initial, repeated, onDraft, onComplete }: { initial?: number[]; repeated: boolean; onDraft: (v: number[]) => void; onComplete: (v: number[]) => void }) {
  const [answers, setAnswers] = useState<number[]>(initial ?? Array(24).fill(0));
  const [group, setGroup] = useState(0);
  const section = TEST_GROUPS[group];
  const answered = answers.filter(Boolean).length;
  if (!section) return null;
  const update = (index: number, value: number) => { const next = answers.map((a,i) => i === index ? value : a); setAnswers(next); onDraft(next); };
  return <div className="space-y-6 animate-rise">
    <p className="text-sm uppercase text-gold">{repeated ? 'После семи дней' : 'До первой карты'} · {answered} / 24</p>
    <h1 className="text-4xl font-semibold">Как я себя слышу</h1>
    <p className="text-muted-foreground">Здесь нет правильных ответов. Отвечай первым импульсом, как оно у тебя сейчас. Этот тест — не оценка, а зеркало.</p>
    <h2 className="text-2xl">{section.title}</h2>
    {TEST_QUESTIONS.slice(section.start, section.end).map((question, offset) => {
      const index = section.start + offset;
      return <fieldset key={index} className="border-b border-border pb-6">
        <legend className="mb-3 font-semibold leading-relaxed">{index + 1}. {question}</legend>
        <div className="grid grid-cols-5 gap-2">{SCALE.map((label, i) => <label key={label} className={`grid min-h-12 cursor-pointer place-items-center rounded-lg border ${answers[index] === i + 1 ? 'border-gold bg-primary text-primary-foreground' : 'border-border bg-card'}`} title={label}>
          <input className="sr-only" type="radio" name={`q-${index}`} aria-label={`${index + 1}: ${i+1} — ${label}`} checked={answers[index] === i+1} onChange={() => update(index,i+1)} />
          <span>{i+1}</span>
        </label>)}</div>
        <p className="mt-2 min-h-5 text-xs text-muted-foreground">{answers[index] ? SCALE[answers[index]-1] : '1 — совсем не про меня · 5 — очень про меня'}</p>
      </fieldset>;
    })}
    <div className="flex gap-3">
      {group > 0 && <Btn variant="ghost" onClick={() => {setGroup(group-1); window.scrollTo(0,0);}}>Назад</Btn>}
      <Btn disabled={answers.slice(section.start,section.end).some(a => !a)} onClick={() => {
        if (group === TEST_GROUPS.length - 1) onComplete(answers);
        else {setGroup(group+1); window.scrollTo(0,0);}
      }}>{group === TEST_GROUPS.length-1 ? 'Посмотреть профиль' : 'Дальше'}</Btn>
    </div>
    <p className="text-xs text-muted-foreground">Ответы и черновик остаются только в этом браузере. Это самонаблюдение, не психологическая диагностика.</p>
  </div>;
}

export function TestProfile({ before, after }: { before: number[]; after?: number[] }) {
  const baseline = scoreTest(before);
  const final = after ? scoreTest(after) : null;
  return <section className="space-y-6">
    <h2 className="text-3xl font-semibold">{after ? 'Что изменилось' : 'Твоя карта опор'}</h2>
    {after && <p className="text-sm text-muted-foreground">До — светлая полоса, после — золотая. Это не оценка: ты выбираешь свой темп.</p>}
    {baseline.map((g,i) => { const next = final?.[i]; return <div key={g.title} className="space-y-2">
      <h3 className="font-sans text-base font-semibold">{g.title}</h3>
      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-blush" style={{width: `${g.value / 5 * 100}%`}} /></div>
      {next && <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gold-gradient" style={{width: `${next.value / 5 * 100}%`}} /></div>}
      <p className="text-sm">{g.value.toFixed(1)}{next ? ` → ${next.value.toFixed(1)}` : ''} · {profileBand(next?.value ?? g.value)}</p>
      {next && <p className="text-xs text-muted-foreground">{next.value > g.value ? 'Ты отметила больше опоры.' : next.value < g.value ? 'Ты ответила иначе — это повод прислушаться к себе, не оценка ухудшения.' : 'Пока без движения. Это нормально.'}</p>}
    </div>; })}
    <p className="text-xs text-muted-foreground">Профиль рассчитан по авторскому файлу: обратные вопросы 8, 11, 17, 20. Среднее от 4 — ресурс, от 2 до 4 — движение, ниже 2 — зона Тени. Тест не подтверждает наличие Тени или проекции.</p>
  </section>;
}