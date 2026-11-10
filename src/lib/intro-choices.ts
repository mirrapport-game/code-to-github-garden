import { assignDay, emptyChallenge, type ChallengeAnswer } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

const KEY = 'rapport-intro-choices-v1';
export type IntroChoices = { theme: string; cardId: string; draft: Partial<ChallengeAnswer> };

export function introReflectionComplete(answer: Partial<ChallengeAnswer>): boolean {
  return Boolean(answer.choiceId && answer.feelings?.[0]?.trim() && answer.hurt?.trim() && answer.shadow?.trim());
}

export function drawIntroChoices(random = Math.random): IntroChoices | null {
  const assigned = assignDay(emptyChallenge(), 1, random);
  const theme = assigned.assignments[1];
  const cardId = assigned.cardAssignments[1];
  return theme && cardId ? { theme, cardId, draft: {} } : null;
}
export function loadIntroChoices(): IntroChoices | null {
  try {
    const data: IntroChoices | null = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    return data && PLAYABLE_CARDS.some(card => card.id === data.cardId) ? data : null;
  } catch { return null; }
}
export function saveIntroChoices(value: IntroChoices) {
  window.localStorage.setItem(KEY, JSON.stringify(value));
}
export function clearIntroChoices() { window.localStorage.removeItem(KEY); }