import { beforeEach, expect, it } from 'vitest';
import { canContinueIntegration, emptyIntegration, integrationProfile, integrationReactions, pickIntegrationQuality } from '@/lib/intro-integration';
import { drawIntroChoices, saveIntroChoices, loadIntroChoices } from '@/lib/intro-choices';
import { emptyChallenge, loadChallenge } from '@/lib/challenge-store';

beforeEach(()=>window.localStorage.clear());
it('picks exactly one of the participant-selected qualities and never substitutes an unselected quality',()=>{
  expect(pickIntegrationQuality(['Пока не знаю','Наглой','Слабой'])).toBe('Наглой');
  expect(pickIntegrationQuality(['Слабой'])).toBe('Слабой');
  expect(pickIntegrationQuality(['Пока не знаю'])).toBeUndefined();
});
it('uses both author manifestations for the selected audacity quality',()=>{
  expect(integrationProfile('Наглой')).toEqual({name:'Наглость',shadow:'хамство, беспардонность, игнорирование других',integrated:'здоровая дерзость, право заявлять о себе и своих желаниях.'});
});
it('offers four reactions including two integrated and two shadow reactions and permits either choice',()=>{
  const choices = integrationReactions('Наглой');
  expect(choices).toHaveLength(4);
  expect(choices.filter(item=>item.kind==='integrated')).toHaveLength(2);
  expect(choices.filter(item=>item.kind==='shadow')).toHaveLength(2);
  for (const reaction of choices) expect(canContinueIntegration({...emptyIntegration('Наглой'),step:'reaction',reactionId:reaction.id,after:'Злюсь'})).toBe(true);
  expect(canContinueIntegration({...emptyIntegration('Наглой'),step:'reaction',reactionId:'missing',after:'Злюсь'})).toBe(false);
});
it('changes the integrated reaction with the selected quality',()=>{
  expect(integrationReactions('Слабой').find(item=>item.id==='clear')?.text).toContain('Мне нужна помощь');
  expect(integrationReactions('Наглой').find(item=>item.id==='clear')?.text).toContain('Я тоже хочу заявить о своём желании');
});
it('persists the chosen quality, stage and new reaction without changing challenge progress',()=>{
  const assignment=drawIntroChoices(()=>0.2);
  if (!assignment) throw new Error('No introductory assignment');
  const introIntegration={...emptyIntegration('Наглой'),step:'balance' as const,reactionId:'clear',after:'Спокойствие'};
  saveIntroChoices({...assignment,draft:{choiceId:'1',introIntegration}});
  expect(loadIntroChoices()?.draft.introIntegration).toEqual(introIntegration);
  expect(loadIntroChoices()?.draft.choiceId).toBe('1');
  expect(loadChallenge()).toEqual(emptyChallenge());
});