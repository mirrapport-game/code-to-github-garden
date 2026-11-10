import { expect, it } from 'vitest';
import { canContinueJourney, emptyJourney, finishJourney } from '@/lib/challenge-journey';
import { practiceReactions, practiceSupport } from '@/lib/integration-practice';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

it('permits both positive and negative challenge reactions with no written replay',()=>{
  for(const reaction of practiceReactions('Напористость','Настойчивость без давления')) {
    expect(canContinueJourney('shadePlay',{...emptyJourney(),reactionId:reaction.id})).toBe(true);
  }
  expect(canContinueJourney('shadePlay',{...emptyJourney(),reactionId:'invalid'})).toBe(false);
});
it('completes the new challenge without meaning, balance or self-authored resource fields',()=>{
  const card=PLAYABLE_CARDS[0];if(!card)throw new Error('Missing card');
  const journey={...emptyJourney(),step:'resource' as const,before:'Страх',rejected:'Напористость',recognition:'На работе',repelled:'Давление',where:'С друзьями',afraid:'Дома',shadeBefore:{mode:'scale' as const,rating:3},reactionId:'clear',replay:'Назову желание',manifestation:'integrated' as const,afterFeelings:['Радость','Страх'],after:'Радость, Страх',shadeAfter:{mode:'scale' as const,rating:7},...practiceSupport('Напористость','Назвать цель')};
  const answer=finishJourney({level:'soft'},journey,card,1,'Напористость');
  expect(answer?.journey?.shadeBefore).toEqual({mode:'scale',rating:3});
  expect(answer?.journey?.shadeAfter).toEqual({mode:'scale',rating:7});
  expect(answer?.journey?.balance).toBe('');
  expect(answer?.resource).toBe(journey.resource);
  expect(finishJourney({level:'soft'},{...journey,afterFeelings:[]},card,1,'Напористость')).toBeNull();
});