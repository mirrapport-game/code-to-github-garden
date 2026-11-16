import type { ChallengeAnswer } from '@/lib/challenge-store';
import type { GameCard } from '@/lib/cards';
import { CHALLENGE_QUALITIES, CHALLENGE_SPHERES, QUALITIES_MAX, QUALITIES_MIN } from '@/lib/challenge-reflection';

export const JOURNEY_STEPS = ['story', 'scenario', 'reflection', 'shadeMeaning', 'shadeView', 'shadePlay', 'feelings', 'balance', 'request', 'resource'] as const;
export type JourneyStep = typeof JOURNEY_STEPS[number];

export function showShadeProgress(screen: string, step: JourneyStep = 'scenario', acquainted = 0): boolean {
  if (screen === 'day') return ['shadeMeaning', 'shadeView', 'shadePlay', 'feelings', 'balance', 'request', 'resource'].includes(step);
  return ['overview', 'summary', 'feedback'].includes(screen) && acquainted > 0;
}

export type JourneyDraft = {
  practiceMode?: 'reflection' | 'dialogue';
  step: JourneyStep;
  /** Comma-joined selected feelings. */
  before: string;
  /** Comma-joined selected qualities that are hard to accept in another. */
  rejected: string;
  /** Comma-joined selected spheres where these qualities are hard to show. */
  recognition: string;
  /** Legacy free-text field, kept so older saved days still load. */
  repelled: string;
  meaning: string;
  /** Comma-joined selected spheres where the shade quality shows up. */
  where: string;
  /** Comma-joined selected spheres where the participant is afraid to show it. */
  afraid: string;
  replay: string;
  /** Comma-joined selected feelings after the new reaction. */
  after: string;
  manifestation: 'shadow' | 'integrated' | 'neither' | '';
  balance: string;
  resource: string;
  smallStep: string;
  reactionId?: string;
  /** AI feedback after the written new-reaction dialogue. */
  feedback?: string;
  dialogue?: { role: 'participant' | 'other'; text: string }[];
  firstReactionId?: string;
  firstReactionText?: string;
  firstDialogue?: { role: 'participant' | 'other'; text: string }[];
  firstDialogueComplete?: boolean;
  afterFeelings?: string[];
  requestText?: string;
  /** The only free-text answer in the challenge: how the day connects to the request. */
  requestReflection?: string;
  /** Selected «что заметить в себе хорошего» items. */
  seedGood?: string[];
  /** Selected «посеять новое» action. */
  seedAction?: string;
};

export function emptyJourney(): JourneyDraft {
  return {step:'story',before:'',rejected:'',recognition:'',repelled:'',meaning:'',where:'',afraid:'',replay:'',after:'',manifestation:'',balance:'',resource:'',smallStep:''};
}

function splitSelected(value: string): string[] {
  return value.split(', ').map(item => item.trim()).filter(Boolean);
}

export function canContinueJourney(step: JourneyStep, draft: JourneyDraft, level?: string): boolean {
  switch (step) {
    case 'scenario': return (level === 'soft' || level === 'medium' || level === 'hard') && (draft.practiceMode === 'reflection' || draft.firstDialogueComplete !== false);
    case 'reflection': {
      const qualities = splitSelected(draft.rejected);
      return Boolean(draft.before.trim()) && qualities.length >= QUALITIES_MIN && qualities.length <= QUALITIES_MAX && qualities.every(item => CHALLENGE_QUALITIES.includes(item)) && splitSelected(draft.recognition).length > 0;
    }
    case 'shadeMeaning': return splitSelected(draft.where).length > 0 && splitSelected(draft.afraid).length > 0 && [...splitSelected(draft.where), ...splitSelected(draft.afraid)].every(item => CHALLENGE_SPHERES.includes(item));
    case 'shadeView': return true;
    case 'shadePlay': return draft.practiceMode === 'reflection' ? ['shadow','integrated','neither'].includes(draft.manifestation) : draft.feedback !== undefined ? Boolean(draft.replay.trim() && draft.feedback.trim()) : draft.reactionId ? ['pressure','clear','hide','pause'].includes(draft.reactionId) : Boolean(draft.replay.trim() && draft.after.trim() && draft.manifestation);
    case 'feelings': return draft.practiceMode === 'reflection' || draft.reactionId || draft.feedback ? Boolean(draft.afterFeelings?.length) : Boolean(draft.after.trim());
    case 'balance': return Boolean(draft.balance.trim());
    case 'resource': return Boolean(draft.resource.trim() && draft.smallStep.trim() && draft.seedGood?.length && draft.seedAction);
    case 'story': return true;
    case 'request': return !draft.requestText?.trim() || Boolean(draft.requestReflection?.trim());
  }
}

export function finishJourney(answer: Partial<ChallengeAnswer>, journey: JourneyDraft, card: GameCard, day: number, theme: string, shadeId?: string, requestText?: string): ChallengeAnswer | null {
  journey = {...journey,...(requestText ? {requestText} : {})};
  const aiJourney = Boolean(journey.feedback?.trim());
  const required = (JOURNEY_STEPS.filter(step => !(journey.practiceMode === 'reflection' ? ['balance','request','resource'] : aiJourney ? ['balance','request','feelings','resource'] : ['balance','request']).includes(step)) as JourneyStep[]);
  if (requestText && !canContinueJourney('request', journey)) return null;
  if (!required.every(step => canContinueJourney(step, journey, answer.level))) return null;
  const seeds = [...(journey.seedGood ?? []), ...(journey.seedAction ? [journey.seedAction] : [])];
  return {day,stage:theme,cardId:card.id,cardStage:card.stage,shadeId,level:answer.level ?? 'soft',feelings:splitSelected(journey.before),body:[],hurt:splitSelected(journey.recognition).join(', '),shadow:journey.rejected,resource:journey.resource,practice:[...seeds, journey.smallStep].filter(Boolean),personalAnswer:journey.replay,storyRead:true,journey,doneAt:new Date().toISOString()};
}
