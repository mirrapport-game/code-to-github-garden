import { Btn } from '@/components/game-ui';
import type { ChallengeAnswer } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';
import { DEMO_CARDS } from '@/lib/demo-cards';
import { SHADOW_SHADES } from '@/lib/shadow-shades';

export function ChallengeDaySummary({answer}: {answer:ChallengeAnswer}) {
  const card=PLAYABLE_CARDS.find(item=>item.id===answer.cardId) ?? DEMO_CARDS.find(item=>item.stage===answer.stage);
  const shade=SHADOW_SHADES.find(item=>item.id===answer.shadeId);
  const journey=answer.journey;
  return <div className="space-y-6">
    <h2 className="text-4xl font-semibold">Итог дня {answer.day}</h2>
    {[
      ['1. Какой сценарий выпал',`${card?.stage ?? answer.cardStage ?? answer.stage} · ${card?.scenario ?? ''}\n${card?.levels[answer.level].text ?? ''}`],
      ['2. Что чувствовала до',journey?.before ?? answer.feelings.join(', ')],
      ['3. Что чувствую после',journey?.after ?? ''],
      [`4. Тень${shade ? ` · ${shade.name}` : ''}`,journey?.reactionId ? (journey.manifestation === 'integrated' ? shade?.integrated : shade?.shadow) : journey?.balance ?? answer.shadow],
      ['Мой новый ответ',journey?.replay ?? answer.personalAnswer ?? ''],
      ['Мой ресурс',journey?.resource ?? answer.resource],
      ['Маленький шаг',journey?.smallStep ?? ''],
      ['Присматриваюсь к лучшему',journey?.seedGood?.length ? journey.seedGood.map(item=>`· ${item}`).join('\n') : ''],
      ['Сею новое',journey?.seedAction ?? ''],
      ['Мой запрос',journey?.requestText ?? ''],
      ['Как это связано с моим запросом',journey?.requestReflection ?? ''],
    ].filter(([,text])=>text).map(([title,text])=><section key={title} className="border-b border-border pb-5"><h3 className="text-2xl font-semibold">{title}</h3><p className="mt-3 whitespace-pre-line leading-relaxed">{text}</p></section>)}
  </div>;
}

export function ChallengeInvitations() {
  return <section className="space-y-3 border-t border-border pt-6">
    <p className="mb-5 font-display text-2xl">Это знакомство с «Раппорт: ЖиваЯ». Продолжить можно с живым собеседником — онлайн или вживую.</p>
    <Btn disabled>Записаться на живую игру</Btn><Btn disabled variant="night">Записаться на онлайн-игру</Btn><Btn disabled variant="ghost">Записаться на консультацию</Btn>
    <p className="text-sm text-muted-foreground">Запись пока не открыта — ждём ссылки организатора.</p>
  </section>;
}
