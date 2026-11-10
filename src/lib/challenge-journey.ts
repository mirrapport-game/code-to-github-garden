import type { ChallengeAnswer } from '@/lib/challenge-store';
import type { GameCard } from '@/lib/cards';

export const JOURNEY_STEPS = ['scenario', 'reflection', 'story', 'shadeMeaning', 'shadeView', 'shadePlay', 'feelings', 'balance', 'request', 'resource'] as const;
export type JourneyStep = typeof JOURNEY_STEPS[number];
export type ShadeAssessment = {mode:'scale';rating:number} | {mode:'words';text:string};
export function validShadeAssessment(value?: ShadeAssessment): boolean {
  return value?.mode === 'scale' ? Number.isInteger(value.rating) && value.rating >= 1 && value.rating <= 10 : value?.mode === 'words' ? Boolean(value.text.trim()) : false;
}
export function shadeRatingChange(before?: ShadeAssessment, after?: ShadeAssessment): number | null {
  return before?.mode === 'scale' && after?.mode === 'scale' && validShadeAssessment(before) && validShadeAssessment(after) ? after.rating - before.rating : null;
}
export function showShadeProgress(screen: string, step: JourneyStep = 'scenario', acquainted = 0): boolean {
  if (screen === 'day') return ['shadeMeaning', 'shadeView', 'shadePlay', 'feelings', 'balance', 'request', 'resource'].includes(step);
  return ['overview', 'summary', 'feedback'].includes(screen) && acquainted > 0;
}
export type JourneyDraft = {
  step: JourneyStep;
  before: string;
  rejected: string;
  recognition: string;
  repelled: string;
  meaning: string;
  where: string;
  afraid: string;
  replay: string;
  after: string;
  manifestation: 'shadow' | 'integrated' | 'neither' | '';
  balance: string;
  resource: string;
  smallStep: string;
  reactionId?: string;
  afterFeelings?: string[];
  requestText?: string;
  requestReflection?: string;
  shadeBefore?: ShadeAssessment;
  shadeAfter?: ShadeAssessment;
};
export function emptyJourney(): JourneyDraft {
  return {step:'scenario',before:'',rejected:'',recognition:'',repelled:'',meaning:'',where:'',afraid:'',replay:'',after:'',manifestation:'',balance:'',resource:'',smallStep:''};
}
export function canContinueJourney(step: JourneyStep, draft: JourneyDraft, level?: string): boolean {
  const filled = (...values: string[]) => values.every(value => Boolean(value.trim()));
  switch (step) {
    case 'scenario': return level === 'soft' || level === 'medium' || level === 'hard';
    case 'reflection': return filled(draft.before,draft.rejected,draft.recognition,draft.repelled);
    case 'shadeMeaning': return filled(draft.where,draft.afraid) && draft.shadeBefore?.mode === 'scale' && validShadeAssessment(draft.shadeBefore);
    case 'shadeView': return true;
    case 'shadePlay': return draft.reactionId ? ['pressure','clear','hide','pause'].includes(draft.reactionId) : filled(draft.replay,draft.after,draft.manifestation);
    case 'feelings': return draft.reactionId ? Boolean(draft.afterFeelings?.length) && draft.shadeAfter?.mode === 'scale' && validShadeAssessment(draft.shadeAfter) : filled(draft.after);
    case 'balance': return filled(draft.balance) && (!draft.shadeBefore || validShadeAssessment(draft.shadeAfter));
    case 'resource': return filled(draft.resource,draft.smallStep);
    case 'story': return true;
    case 'request': return !draft.requestText?.trim() || Boolean(draft.requestReflection?.trim());
  }
}
export function finishJourney(answer: Partial<ChallengeAnswer>, journey: JourneyDraft, card: GameCard, day: number, theme: string, shadeId?: string, requestText?: string): ChallengeAnswer | null {
  journey = {...journey,...(requestText ? {requestText} : {})};
  const required = journey.reactionId ? JOURNEY_STEPS.filter(step => step !== 'balance') : JOURNEY_STEPS.filter(step => step !== 'shadeMeaning');
  if (!journey.reactionId && ![journey.meaning,journey.where,journey.afraid].every(value=>value.trim())) return null;
  if (!required.every(step => canContinueJourney(step,journey,answer.level))) return null;
  return {day,stage:theme,cardId:card.id,cardStage:card.stage,shadeId,level:answer.level ?? 'soft',feelings:[journey.before],body:[],hurt:journey.repelled,shadow:journey.rejected,resource:journey.resource,practice:[journey.balance,journey.smallStep],personalAnswer:journey.replay,storyRead:true,journey,doneAt:new Date().toISOString()};
}