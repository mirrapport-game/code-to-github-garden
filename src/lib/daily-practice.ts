import type { SeasonState } from '@/lib/season-store';
import {activeRequest} from '@/lib/challenge-request';

export const PRACTICE_DAYS = 7;
const calendar = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
export function practiceStatus(state: SeasonState, now = new Date()) {
  const completed = Array.from({length: PRACTICE_DAYS}, (_, i) => i + 1).filter(day => Boolean(state.days[day]?.doneAt));
  const day = Array.from({length: PRACTICE_DAYS}, (_, i) => i + 1).find(day => !state.days[day]?.doneAt) ?? 8;
  const start = state.dailyPractice?.startedAt ?? state.days[1]?.doneAt;
  const elapsed = start ? Math.max(0, Math.floor((calendar(now) - calendar(new Date(start))) / 86400000)) : 0;
  const playedToday = completed.some(day => {const entry = state.days[day]; return entry ? calendar(new Date(entry.doneAt)) >= calendar(now) : false;});
  return {day, completed, finished: day > PRACTICE_DAYS, unlocked: !playedToday && day <= PRACTICE_DAYS && day <= elapsed + 1};
}
export function assignPractice(state: SeasonState, cardIds: string[], now = new Date(), random = Math.random): SeasonState {
  const status = practiceStatus(state, now);
  if (!status.unlocked) return state;
  const assignments = {...state.dailyPractice?.assignments};
  if (!assignments[status.day]) {
    const used = new Set([...Object.values(assignments), ...Object.values(state.days).map(day => day.cardId)]);
    const available = cardIds.filter(id => !used.has(id));
    const chosen = available[Math.min(available.length - 1, Math.floor(random() * available.length))];
    if (!chosen) return state;
    assignments[status.day] = chosen;
  }
  return {...state, dailyPractice: {...state.dailyPractice, startedAt: state.dailyPractice?.startedAt ?? state.days[1]?.doneAt ?? now.toISOString(), assignments}};
}
export function practiceReflectionReady(requestText: string | undefined, connection: string, action: string) {
  return !requestText || Boolean(connection.trim() && action.trim());
}
export function practiceRequest(state: SeasonState) {return activeRequest(state.dailyPractice?.request);}