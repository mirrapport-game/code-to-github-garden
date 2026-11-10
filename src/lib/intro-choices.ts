import { assignDay, emptyChallenge, type ChallengeAnswer } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

const KEY = 'rapport-intro-choices-v1';
export type IntroChoices = { theme: string; cardId: string; draft: Partial<ChallengeAnswer> };

export const INTRO_FEELINGS = ['Злость', 'Страх', 'Обида', 'Грусть', 'Стыд', 'Вина', 'Тревога', 'Растерянность', 'Раздражение', 'Бессилие', 'Спокойствие', 'Интерес', 'Радость', 'Облегчение', 'Пока не понимаю'];
export const INTRO_QUALITIES = ['Наглость', 'Напористость', 'Резкость', 'Холодность', 'Слабость', 'Уязвимость', 'Эгоизм', 'Упрямство', 'Контроль', 'Независимость', 'Смелость', 'Прямота', 'Требовательность', 'Мягкость', 'Пока не знаю'];
export const INTRO_SELF_QUALITIES = ['Наглой', 'Напористой', 'Резкой', 'Холодной', 'Слабой', 'Уязвимой', 'Эгоистичной', 'Упрямой', 'Контролирующей', 'Независимой', 'Смелой', 'Прямой', 'Требовательной', 'Мягкой', 'Пока не знаю'];
export const INTRO_SPHERES = ['На работе', 'Дома', 'С друзьями', 'С коллегами', 'С близким человеком', 'С родителями', 'С детьми', 'В своём деле', 'С незнакомыми людьми', 'Нигде — позволяю себе'];
export const INTRO_FEARS = ['Осуждения', 'Обвинений', 'Отвержения', 'Конфликта', 'Непонимания', 'Насмешек', 'Потерять отношения', 'Обидеть другого', 'Ошибиться', 'Показаться эгоистичной', 'Потерять контроль', 'Наказания', 'Ничего не боюсь', 'Пока не знаю'];
export function emptyIntroReflection(): NonNullable<ChallengeAnswer['introReflection']> {
  return {qualities:[],notAllowed:[],spheres:[],strength:'',fears:[]};
}

export function introReflectionComplete(answer: Partial<ChallengeAnswer>): boolean {
  const reflection = answer.introReflection;
  return Boolean(answer.choiceId && answer.feelings?.some(value => value.trim()) && reflection?.qualities.length && reflection.notAllowed.length && reflection.fears?.length);
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
    if (!data || !PLAYABLE_CARDS.some(card => card.id === data.cardId)) return null;
    const reflection = data.draft.introReflection;
    if (reflection) reflection.notAllowed = reflection.notAllowed.map(value => INTRO_SELF_QUALITIES[INTRO_QUALITIES.indexOf(value)] ?? value);
    return data;
  } catch { return null; }
}
export function saveIntroChoices(value: IntroChoices) {
  window.localStorage.setItem(KEY, JSON.stringify(value));
  window.dispatchEvent(new Event('rapport-progress-changed'));
}
export function clearIntroChoices() { window.localStorage.removeItem(KEY); }