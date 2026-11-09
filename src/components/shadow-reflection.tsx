import { useState } from 'react';
import cover from '@/assets/shadow-shades-cover.jpg';
import { Btn } from '@/components/game-ui';
import { SHADOW_SHADES } from '@/lib/shadow-shades';
import { SHADE_IMAGES } from '@/lib/shadow-shade-images';

export function ShadowReflection({ shadeId, answers = [], onAnswers }: { shadeId?: string | undefined; answers?: string[] | undefined; onAnswers?: ((answers: string[]) => void) | undefined }) {
  const [opened, setOpened] = useState(!onAnswers);
  const shade = SHADOW_SHADES.find(s => s.id === shadeId);
  if (!shade) return null;
  const image = SHADE_IMAGES[shade.id];
  if (!image) return null;
  const questions = [
    'Какой образ тебе ближе? Что в нём напоминает тебя в этой ситуации?',
    'Где ещё в жизни ты замечаешь что-то похожее?',
    'Что поможет тебе почувствовать больше опоры? С какого маленького шага начнёшь?',
  ];
  return <section className="space-y-5 border-b border-border pb-6">
    <header><p className="text-sm text-gold">Оттенки тени · {shade.category}</p><h2 className="mt-2 text-3xl font-semibold">{opened ? shade.name : 'Твоя карта тени'}</h2></header>
    {!opened ? <>
      <div className="mx-auto max-w-xs"><Btn variant="ghost" className="gold-frame aspect-[2/3] overflow-hidden rounded-lg p-0 shadow-card" onClick={() => setOpened(true)} aria-label="Открыть оттенок тени"><img src={cover} alt="Оттенки тени" width={1024} height={1536} loading="lazy" className="h-full w-full object-contain" /></Btn></div>
      <Btn onClick={() => setOpened(true)}>Открыть оттенок тени</Btn>
    </> : <>
      <p className="text-sm leading-relaxed text-muted-foreground">Эта карта выпала случайно. Примерь её образы к ситуации: что-то может быть знакомо, а что-то — совсем не про тебя. Это не оценка и не диагноз.</p>
      <p className="font-display text-xl italic text-gold">{image.associations}</p>
      <div className="border-l-2 border-gold pl-4"><h3 className="text-2xl font-semibold">Когда тень мешает</h3><p className="mt-2 leading-relaxed">{image.shadow}</p></div>
      <div className="border-l-2 border-gold pl-4"><h3 className="text-2xl font-semibold">Когда эта сила помогает</h3><p className="mt-2 leading-relaxed">{image.integrated}</p></div>
      <p className="text-xs text-muted-foreground">Оставь только то, что тебе откликается. Если тебе причинили вред, это не твоя вина: не нужно терпеть насилие или искать в нём пользу.</p>
      {questions.map((question, i) => onAnswers ? <label key={question} className="block space-y-2"><span className="font-semibold">{question}</span><textarea aria-label={question} value={answers[i] ?? ''} onChange={e => onAnswers(questions.map((_, j) => j === i ? e.target.value : answers[j] ?? ''))} className="min-h-24 w-full rounded-lg border border-input bg-card p-3 outline-none focus:border-gold" /></label> : answers[i] ? <div key={question}><p className="font-semibold">{question}</p><p className="mt-2 whitespace-pre-line leading-relaxed">{answers[i]}</p></div> : null)}
      {onAnswers && <p className="text-sm text-muted-foreground">Можно оставить вопросы без ответа.</p>}
    </>}
  </section>;
}