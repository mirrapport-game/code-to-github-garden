import { assignDay, emptyChallenge, type ChallengeAnswer } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

const KEY = 'rapport-intro-choices-v1';
export type IntroChoices = { theme: string; cardId: string; draft: Partial<ChallengeAnswer> };

export const INTRO_FEELINGS = ['Злость', 'Страх', 'Обида', 'Грусть', 'Стыд', 'Вина', 'Тревога', 'Растерянность', 'Раздражение', 'Бессилие', 'Спокойствие', 'Интерес', 'Радость', 'Облегчение', 'Пока не понимаю'];
export const INTRO_QUALITIES = ['Наглость', 'Напористость', 'Резкость', 'Холодность', 'Слабость', 'Уязвимость', 'Эгоизм', 'Упрямство', 'Контроль', 'Независимость', 'Смелость', 'Прямота', 'Требовательность', 'Мягкость', 'Пока не знаю'];
export const INTRO_SPHERES = ['На работе', 'Дома', 'С друзьями', 'С коллегами', 'С близким человеком', 'С родителями', 'С детьми', 'В своём деле', 'С незнакомыми людьми', 'Пока нигде не замечаю'];
export function emptyIntroReflection(): NonNullable<ChallengeAnswer['introReflection']> {
  return {qualities:[],notAllowed:[],spheres:[],strength:''};
}

export function introReflectionComplete(answer: Partial<ChallengeAnswer>): boolean {
  const reflection = answer.introReflection;
  return Boolean(answer.choiceId && answer.feelings?.some(value => value.trim()) && reflection?.qualities.length && reflection.notAllowed.length && reflection.spheres.length && reflection.strength.trim());
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