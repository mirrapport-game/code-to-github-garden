import type { ChallengeAnswer } from '@/lib/challenge-store';
import { cardChoices } from '@/lib/card-choices';
import { ShadowReflection } from '@/components/shadow-reflection';

export function ChoiceReflection({ answer }: { answer: Partial<ChallengeAnswer> }) {
  if (!answer.stage || !answer.level) return null;
  const choice = cardChoices(answer.stage, answer.level, answer.cardId).find(item => item.id === answer.choiceId);
  if (!choice) return null;
  return <div className="space-y-6">
    <ShadowReflection shadeId={answer.shadeId} answers={answer.shadowAnswers} />
    <section className="border-b border-border pb-5"><h2 className="text-3xl font-semibold">Твой отклик</h2>{answer.cardStage && <p className="mt-2 text-sm text-gold">{answer.cardStage} · {answer.stage}</p>}<blockquote className="mt-4 border-l-2 border-gold pl-4 font-display text-2xl">«{answer.responseText ?? choice.text}»</blockquote></section>
    <section><h3 className="text-2xl font-semibold">Что ты узнаёшь о себе</h3><p className="mt-3 leading-relaxed">{choice.reflection}</p><p className="mt-3 text-sm text-muted-foreground">Это возможное отражение выбранного ответа, не оценка личности. Оставь только то, что откликается.</p></section>
    <section><h3 className="text-2xl font-semibold">Рекомендация</h3><p className="mt-3 leading-relaxed">{choice.recommendation}</p></section>
    <section><h3 className="text-2xl font-semibold">Твой ресурс</h3><p className="mt-3 leading-relaxed">{choice.resource}</p></section>
    <section className="border-t border-border pt-5"><h3 className="text-2xl font-semibold">Маленький шаг</h3><p className="mt-3 leading-relaxed">{choice.smallStep}</p><p className="mt-3 text-sm text-muted-foreground">Только если это посильно и безопасно. Можно остановиться и обратиться за поддержкой.</p></section>
  </div>;
}