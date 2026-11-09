import { DEMO_CARDS } from '@/lib/demo-cards';
import type { DayAnswer } from '@/lib/season-store';
export const CHALLENGE_KEY = 'rapport-challenge-7-v1';
export type ChallengeAnswer = DayAnswer & { practice: string[] };
export type Feedback = { takeaway: string; character: string; useful: string; difficult: string; change: string; format: string; rating: number };
export type ChallengeState = {
  name: string;
  startedAt?: string;
  baseline?: number[];
  finalTest?: number[];
  testDrafts: { before?: number[]; after?: number[] };
  assignments: Record<number, string>;
  days: Record<number, ChallengeAnswer>;
  drafts: Record<number, Partial<ChallengeAnswer>>;
  feedback?: Feedback;
};
export function emptyChallenge(): ChallengeState { return { name: '', assignments: {}, days: {}, drafts: {}, testDrafts: {} }; }
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
  if (state.assignments[day]) return state;
  const used = Object.values(state.assignments);
  const pool = DEMO_CARDS.filter(c => !used.includes(c.stage));
  const card = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  return card ? { ...state, assignments: { ...state.assignments, [day]: card.stage } } : state;
}
