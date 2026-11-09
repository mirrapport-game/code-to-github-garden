import { DEMO_CARDS } from '@/lib/demo-cards';
import { cardsForTheme } from '@/lib/official-cards';
import { drawShade } from '@/lib/shadow-shades';
import type { DayAnswer } from '@/lib/season-store';
export const CHALLENGE_KEY = 'rapport-challenge-7-v2';
export type ChallengeAnswer = DayAnswer & { practice: string[]; topicAnswers?: string[]; choiceId?: string; cardId?: string | undefined; cardStage?: string; responseText?: string; shadeId?: string | undefined; shadowAnswers?: string[] | undefined };
export type Feedback = { takeaway: string; character: string; useful: string; difficult: string; change: string; format: string; rating: number };
export type ChallengeState = {
  name: string;
  startedAt?: string;
  baseline?: number[];
  finalTest?: number[];
  testDrafts: { before?: number[]; after?: number[] };
  assignments: Record<number, string>;
  cardAssignments: Record<number, string>;
  shadeAssignments: Record<number, string>;
  days: Record<number, ChallengeAnswer>;
  drafts: Record<number, Partial<ChallengeAnswer>>;
  feedback?: Feedback;
};
export function emptyChallenge(): ChallengeState { return { name: '', assignments: {}, cardAssignments: {}, shadeAssignments: {}, days: {}, drafts: {}, testDrafts: {} }; }
export function hasPreviousChallenge(): boolean {
  if (typeof window === 'undefined') return false;
  try { return Boolean(JSON.parse(window.localStorage.getItem('rapport-challenge-7-v1') || 'null')?.baseline); } catch { return false; }
}
export function loadChallenge(): ChallengeState {
  if (typeof window === 'undefined') return emptyChallenge();
  try { const data = JSON.parse(window.localStorage.getItem(CHALLENGE_KEY) || 'null'); return data ? { ...emptyChallenge(), ...data } : emptyChallenge(); } catch { return emptyChallenge(); }
}
export function saveChallenge(state: ChallengeState) {
  window.localStorage.setItem(CHALLENGE_KEY, JSON.stringify(state));
  return state;
}
export function clearChallenge() { window.localStorage.removeItem(CHALLENGE_KEY); }
/** Assign once, persist before revealing, avoid repeat themes within the challenge. */
export function assignDay(state: ChallengeState, day: number, random = Math.random): ChallengeState {
  if (state.assignments[day]) return assignShade(state, day, random);
  const used = Object.values(state.assignments);
  const pool = DEMO_CARDS.filter(c => !used.includes(c.stage));
  const card = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  if (!card) return state;
  const scenarios = cardsForTheme(card.stage).filter(c => !Object.values(state.cardAssignments ?? {}).includes(c.id ?? ''));
  const scenario = scenarios[Math.min(scenarios.length - 1, Math.floor(random() * scenarios.length))];
  return assignShade({ ...state, assignments: { ...state.assignments, [day]: card.stage }, cardAssignments: {...state.cardAssignments, ...(scenario?.id ? {[day]:scenario.id} : {})} }, day, random);
}
function assignShade(state: ChallengeState, day: number, random: () => number): ChallengeState {
  if (state.shadeAssignments?.[day] || state.days[day]) return state;
  const theme = state.assignments[day];
  if (!theme) return state;
  const shade = drawShade(state.cardAssignments[day], theme, Object.values(state.shadeAssignments ?? {}), random);
  return shade ? {...state, shadeAssignments: {...state.shadeAssignments, [day]:shade.id}} : state;
}
