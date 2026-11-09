import { useState } from 'react';
import cover from '@/assets/shadow-shades-cover.jpg';
import { Btn } from '@/components/game-ui';
import { SHADOW_SHADES } from '@/lib/shadow-shades';

export function ShadowReflection({ shadeId, answers = [], onAnswers }: { shadeId?: string | undefined; answers?: string[] | undefined; onAnswers?: ((answers: string[]) => void) | undefined }) {
  const [opened, setOpened] = useState(!onAnswers);
  const shade = SHADOW_SHADES.find(s => s.id === shadeId);
  if (!shade) return null;
  const questions = [
    `Где эта ситуация для тебя про «${shade.name}»? Узнаёшь ли ты себя?`,
    'В каких сферах твоей жизни это проявляется и как именно?',
    'Как могло бы выглядеть интегрированное проявление в этой ситуации? Какой маленький шаг тебе доступен?',
  ];
  return <section className="space-y-5 border-b border-border pb-6">
    <header><p className="text-sm text-gold">Оттенки тени · {shade.category}</p><h2 className="mt-2 text-3xl font-semibold">{opened ? shade.name : 'Твоя карта тени'}</h2></header>
    {!opened ? <>
      <div className="mx-auto max-w-xs"><Btn variant="ghost" className="gold-frame aspect-[2/3] overflow-hidden rounded-lg p-0 shadow-card" onClick={() => setOpened(true)} aria-label="Открыть оттенок тени"><img src={cover} alt="Оттенки тени" width={1024} height={1536} loading="lazy" className="h-full w-full object-contain" /></Btn></div>
      <Btn onClick={() => setOpened(true)}>Открыть оттенок тени</Btn>
    </> : <>
      <p className="text-sm leading-relaxed text-muted-foreground">Это случайный ракурс для размышления, а не вывод о тебе. Он может не откликнуться. Здесь «жертва» — про способ реагирования, не про вину за причинённый тебе вред; интеграция не оправдывает насилие.</p>
      <div className="border-l-2 border-gold pl-4"><h3 className="text-2xl font-semibold">Теневое проявление</h3><p className="mt-2 leading-relaxed">{shade.shadow}</p></div>
      <div className="border-l-2 border-gold pl-4"><h3 className="text-2xl font-semibold">Интегрированное проявление</h3><p className="mt-2 leading-relaxed">{shade.integrated}</p></div>
      <p className="text-xs text-muted-foreground">Авторские описания — метафоры для игры, не диагноз и не объяснение причин психологических состояний.</p>
      {questions.map((question, i) => onAnswers ? <label key={question} className="block space-y-2"><span className="font-semibold">{question}</span><textarea aria-label={question} value={answers[i] ?? ''} onChange={e => onAnswers(questions.map((_, j) => j === i ? e.target.value : answers[j] ?? ''))} className="min-h-24 w-full rounded-lg border border-input bg-card p-3 outline-none focus:border-gold" /></label> : answers[i] ? <div key={question}><p className="font-semibold">{question}</p><p className="mt-2 whitespace-pre-line leading-relaxed">{answers[i]}</p></div> : null)}
      {onAnswers && <p className="text-sm text-muted-foreground">Можно оставить вопросы без ответа.</p>}
    </>}
  </section>;
}