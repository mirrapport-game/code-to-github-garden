import type { LevelKey } from "@/lib/cards";
import type { DialogueTurn } from "@/lib/intro-dialogue";

const KEY = "rapport-season-1";

export type DayAnswer = {
  day: number;
  stage: string;
  level: LevelKey;
  feelings: string[];
  body: string[];
  /** What hurt — her own words. */
  hurt: string;
  /** The shadow — what she does not allow herself. */
  shadow: string;
  /** The resource — the support she chooses for herself. */
  resource: string;
  introReflection?: { qualities: string[]; notAllowed: string[]; spheres: string[]; strength: string; fears?: string[] } | undefined;
  introIntegration?: import('@/lib/intro-integration').IntroIntegration | undefined;
  cardId?: string | undefined;
  dialogue?: DialogueTurn[];
  aiSummary?: string;
  shadeId?: string | undefined;
  doneAt: string;
  requestReflection?: {requestText: string; connection: string; action: string};
};

export type SeasonState = {
  name: string;
  days: Record<number, DayAnswer>;
  dailyPractice?: { startedAt: string; assignments: Record<number, string>; request?: import('@/lib/challenge-request').ChallengeRequest; reflections?: Record<number, {requestText: string; connection: string; action: string}> };
};

const EMPTY: SeasonState = { name: "", days: {} };

/** The introductory card must be finished before the challenge entry appears. */
export function hasIntroCompleted(state: SeasonState): boolean {
  return Boolean(state.days[1]);
}

export function loadSeason(): SeasonState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<SeasonState>;
    return { name: parsed.name ?? "", days: parsed.days ?? {}, ...(parsed.dailyPractice ? {dailyPractice: parsed.dailyPractice} : {}) };
  } catch {
    return EMPTY;
  }
}

export function writeSeason(state: SeasonState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('rapport-progress-changed'));
  } catch {
    // storage unavailable (private mode, quota) — the season simply is not remembered
  }
}

export function saveSeasonName(name: string) {
  if (!name.trim()) return;
  const state = loadSeason();
  if (state.name === name.trim()) return;
  writeSeason({ ...state, name: name.trim() });
}

export function saveSeasonDay(entry: DayAnswer): SeasonState {
  const state = loadSeason();
  const next: SeasonState = { ...state, days: { ...state.days, [entry.day]: entry } };
  writeSeason(next);
  return next;
}

export function clearSeason() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to clean up
  }
}
