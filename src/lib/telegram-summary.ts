import type {ChallengeAnswer} from '@/lib/challenge-store';
export function telegramDayText(entry: ChallengeAnswer): string {
  // Reserve room for feedback first; Telegram caps message text at 4096 characters.
  const feedback=entry.journey?.feedback?.trim().slice(0,2400);
  const parts=[`✨ День ${entry.day} из 7 завершён`, `Карта: ${entry.stage}`, entry.journey?.replay && `Моя новая реакция:\n${entry.journey.replay.trim().slice(0,700)}`, feedback && `Обратная связь:\n${feedback}`, entry.resource && `Ресурс: ${entry.resource.trim().slice(0,250)}`, entry.journey?.smallStep && `Маленький шаг: ${entry.journey.smallStep.trim().slice(0,250)}`];
  return parts.filter(Boolean).join('\n\n').slice(0,4000);
}