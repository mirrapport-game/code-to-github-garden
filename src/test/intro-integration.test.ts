import { beforeEach, expect, it } from 'vitest';
import { canContinueIntegration, emptyIntegration, integrationProfile, integrationReactions, pickIntegrationQuality } from '@/lib/intro-integration';
import { drawIntroChoices, saveIntroChoices, loadIntroChoices } from '@/lib/intro-choices';
import { emptyChallenge, loadChallenge } from '@/lib/challenge-store';
import { practiceSupport, validPracticeRating } from '@/lib/integration-practice';

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
});
it('starts at the shade view and requires a written reaction with dialogue feedback',()=>{
  expect(emptyIntegration('Наглой').step).toBe('manifestations');
  const base={...emptyIntegration('Наглой'),step:'reaction' as const};
  expect(canContinueIntegration({...base,personalReaction:'Я тоже хочу'})).toBe(false);
  expect(canContinueIntegration({...base,personalReaction:'',feedback:'Итог'})).toBe(false);
  expect(canContinueIntegration({...base,personalReaction:'Я тоже хочу',feedback:'Итог'})).toBe(true);
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
it('requires the 1–10 baseline and both location answers before introductory manifestations',()=>{
  const value={...emptyIntegration('Напористой'),where:'На работе',afraid:'Дома'};
  expect(canContinueIntegration(value)).toBe(false);
  for (const ratingBefore of [1,10]) expect(canContinueIntegration({...value,ratingBefore})).toBe(true);
  for (const ratingBefore of [0,11,3.5]) expect(canContinueIntegration({...value,ratingBefore})).toBe(false);
  expect(canContinueIntegration({...value,ratingBefore:5,afraid:''})).toBe(false);
});
it('requires selected after feelings instead of free text and retains numeric boundaries',()=>{
  const value={...emptyIntegration('Напористой'),step:'feelings' as const,after:'Радость',ratingAfter:8};
  expect(canContinueIntegration(value)).toBe(false);
  expect(canContinueIntegration({...value,afterFeelings:['Радость','Страх']})).toBe(true);
  expect(validPracticeRating(1)).toBe(true);
  expect(validPracticeRating(10)).toBe(true);
  expect(validPracticeRating(11)).toBe(false);
});
it('suggests resource and step without participant-authored resource answers',()=>{
  const support=practiceSupport('Напористость','Обозначать цель без давления');
  expect(canContinueIntegration({...emptyIntegration('Напористой'),step:'resource',...support})).toBe(true);
  expect(support.resource.length).toBeGreaterThan(0);
  expect(support.smallStep).not.toBe(practiceSupport('Слабость','Просить помощь').smallStep);
});