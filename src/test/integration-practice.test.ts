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
it('completes the challenge from selections only, with ready resource and seed items',()=>{
  const card=PLAYABLE_CARDS[0];if(!card)throw new Error('Missing card');
  const journey={...emptyJourney(),step:'resource' as const,before:'Страх',rejected:'Наглость, Холодность, Контроль',recognition:'Семья',where:'Дружба',afraid:'Деньги',reactionId:'clear',replay:'Назову желание',manifestation:'integrated' as const,afterFeelings:['Радость','Страх'],after:'Радость, Страх',seedGood:['Я заметила своё чувство и не отмахнулась от него'],seedAction:'Сказать «нет» в одной безопасной ситуации на этой неделе',...practiceSupport('Напористость','Назвать цель')};
  const answer=finishJourney({level:'soft'},journey,card,1,'Напористость');
  expect(answer?.journey?.balance).toBe('');
  expect(answer?.resource).toBe(journey.resource);
  expect(answer?.practice).toContain('Сказать «нет» в одной безопасной ситуации на этой неделе');
  expect(finishJourney({level:'soft'},{...journey,afterFeelings:[]},card,1,'Напористость')).toBeNull();
  const {seedAction: _seedAction, ...withoutAction} = journey;
  expect(finishJourney({level:'soft'},withoutAction,card,1,'Напористость')).toBeNull();
});
