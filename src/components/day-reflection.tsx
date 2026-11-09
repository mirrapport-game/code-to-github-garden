import type { ChallengeAnswer } from '@/lib/challenge-store';
import { THEME_REFLECTIONS } from '@/lib/theme-reflection';

export function DayReflection({ stage, answer }: { stage: string; answer: Partial<ChallengeAnswer> }) {
  const theme = THEME_REFLECTIONS[stage];
  if (!theme) return null;
  return <div className="space-y-6">
    <section className="border-b border-border pb-5">
      <h2 className="text-3xl font-semibold">Что ты заметила о себе</h2>
      <p className="mt-2 text-sm text-muted-foreground">Тема: {stage}. Это отражение твоих слов и возможное направление исследования, не оценка личности.</p>
      <dl className="mt-5 space-y-4">{theme.questions.map((question, index) => answer.topicAnswers?.[index]?.trim() && <div key={question}><dt className="font-semibold">{question}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">{answer.topicAnswers[index]}</dd></div>)}</dl>
    </section>
    <section className="border-l-2 border-gold pl-4">
      <h3 className="text-2xl font-semibold">Возможная тень</h3>
      {answer.shadow?.trim() && <><p className="mt-3 text-sm text-muted-foreground">Ты написала о том, что себе не разрешаешь:</p><blockquote className="mt-2 whitespace-pre-wrap break-words font-display text-2xl">«{answer.shadow}»</blockquote></>}
      <p className="mt-3 leading-relaxed">{theme.possibility}</p>
      <p className="mt-3 text-sm text-muted-foreground">Это предположение по теме карты, а не вывод из твоего текста. Оно может не подходить тебе — оставь только то, что откликается.</p>
    </section>
    <section><h3 className="text-2xl font-semibold">Твой ресурс</h3><p className="mt-3 leading-relaxed">{theme.resource}</p>{answer.resource?.trim() && <><p className="mt-3 text-sm text-muted-foreground">Поддержка, которую ты предложила подруге, может стать поддержкой и для тебя:</p><blockquote className="mt-2 whitespace-pre-wrap break-words font-display text-2xl">«{answer.resource}»</blockquote></>}</section>
    <section className="border-t border-border pt-5"><h3 className="text-2xl font-semibold">Маленький шаг для себя</h3><p className="mt-3 leading-relaxed">{theme.recommendation}</p><p className="mt-3 text-sm text-muted-foreground">Выбери только посильное и безопасное. Если практика усиливает тяжёлые переживания, можно остановиться и обратиться за поддержкой.</p></section>
  </div>;
}