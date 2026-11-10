import type { ChallengeAnswer } from '@/lib/challenge-store';
import type { GameCard } from '@/lib/cards';

export const JOURNEY_STEPS = ['scenario', 'reflection', 'story', 'shadeMeaning', 'shadePlay', 'balance', 'resource'] as const;
export type JourneyStep = typeof JOURNEY_STEPS[number];
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
};
export function emptyJourney(): JourneyDraft {
  return {step:'scenario',before:'',rejected:'',recognition:'',repelled:'',meaning:'',where:'',afraid:'',replay:'',after:'',manifestation:'',balance:'',resource:'',smallStep:''};
}
export function canContinueJourney(step: JourneyStep, draft: JourneyDraft, level?: string): boolean {
  const filled = (...values: string[]) => values.every(value => Boolean(value.trim()));
  switch (step) {
    case 'scenario': return level === 'soft' || level === 'medium' || level === 'hard';
    case 'reflection': return filled(draft.before,draft.rejected,draft.recognition,draft.repelled);
    case 'shadeMeaning': return filled(draft.meaning,draft.where,draft.afraid);
    case 'shadePlay': return filled(draft.replay,draft.after,draft.manifestation);
    case 'balance': return filled(draft.balance);
    case 'resource': return filled(draft.resource,draft.smallStep);
    case 'story': return true;
  }
}
export function finishJourney(answer: Partial<ChallengeAnswer>, journey: JourneyDraft, card: GameCard, day: number, theme: string, shadeId?: string): ChallengeAnswer | null {
  if (!JOURNEY_STEPS.every(step => canContinueJourney(step,journey,answer.level))) return null;
  return {day,stage:theme,cardId:card.id,cardStage:card.stage,shadeId,level:answer.level ?? 'soft',feelings:[journey.before],body:[],hurt:journey.repelled,shadow:journey.rejected,resource:journey.resource,practice:[journey.balance,journey.smallStep],personalAnswer:journey.replay,storyRead:true,journey,doneAt:new Date().toISOString()};
}