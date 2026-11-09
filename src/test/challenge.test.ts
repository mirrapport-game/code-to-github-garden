import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_CARDS, DEMO_THEMES } from '@/lib/demo-cards';
import { assignDay, clearChallenge, emptyChallenge, loadChallenge, saveChallenge, type ChallengeState } from '@/lib/challenge-store';
import { canOpenDay, CHALLENGE_LENGTH, challengeComplete, PRACTICES } from '@/lib/challenge';
import { profileBand, REVERSED_QUESTIONS, scoreTest, TEST_QUESTIONS } from '@/lib/self-test';

const started = () => ({...emptyChallenge(), baseline:Array(24).fill(3), startedAt:new Date(2026,10,9,22,7).toISOString()});
const entry = (day: number) => ({day, stage:'Границы', level:'soft' as const, feelings:['обида'], body:['грудь'],hurt:'Нет времени',shadow:'Отказывать',resource:'Я могу выбрать',practice:['Мой ответ'],doneAt:new Date(2026,10,9,22,8).toISOString()});
describe('Seven-day challenge', () => {
  beforeEach(() => clearChallenge());
  it('has exactly seven days and practices', () => {expect(CHALLENGE_LENGTH).toBe(7); expect(PRACTICES).toHaveLength(7);});
  it('draws from all nine requested themes', () => {expect(DEMO_CARDS.map(c => c.stage)).toEqual(['Границы','Просьба о помощи','Влияние','Дистанция','Слабость','Наглость','Жертва','Манипуляция','Холодность']); expect(DEMO_THEMES).toHaveLength(9);});
  it('assigns seven distinct random cards', () => {let state: ChallengeState = started(); for(let day=1;day<=7;day++) state = assignDay(state,day,() => 0.5); expect(new Set(Object.values(state.assignments)).size).toBe(7);});
  it('keeps the same card after reload', () => {const state=assignDay(started(),1,() => 0); saveChallenge(state); expect(assignDay(loadChallenge(),1,() => 0.99).assignments[1]).toBe('Границы');});
  it('requires the baseline before a card', () => {expect(canOpenDay(emptyChallenge(),1,new Date(2026,10,9,23))).toBe(false);});
  it('opens day two on the next calendar day, not the same evening', () => {const state={...started(),days:{1:entry(1)}}; expect(canOpenDay(state,2,new Date(2026,10,9,23,59))).toBe(false); expect(canOpenDay(state,2,new Date(2026,10,10,0,0))).toBe(true);});
  it('requires previous day completion', () => {expect(canOpenDay(started(),2,new Date(2026,10,10,12))).toBe(false);});
  it('does not allow another card on a completed day', () => {expect(canOpenDay({...started(),days:{1:entry(1)}},1,new Date(2026,10,9,23))).toBe(false);});
  it('unlocks the final flow only after all seven answers', () => {const state=started(); state.days = {1:entry(1)}; expect(challengeComplete(state)).toBe(false); for(let d=2;d<=7;d++) state.days[d]=entry(d); expect(challengeComplete(state)).toBe(true);});
  it('persists baseline, final test, drafts and feedback', () => {const state={...started(),finalTest:Array(24).fill(4), drafts:{1:entry(1)},feedback:{takeaway:'Право на паузу',character:'Границы',useful:'Просьбы',difficult:'Отказ',change:'Темп',format:'Онлайн-игра',rating:4}};saveChallenge(state); expect(loadChallenge()).toEqual(state);});
});
describe('Author test scoring', () => {
  it('uses all 24 uploaded statements', () => expect(TEST_QUESTIONS).toHaveLength(24));
  it.each([8,11,17,20])('inverts question %i using 6 minus answer', number => {const answers=Array(24).fill(3); answers[number-1]=1;const scores=scoreTest(answers);const group=scores.find(g => g.start <= number-1 && g.end > number-1);expect(group?.value).toBe(3+2/5);});
  it('inverts no extra questions', () => {expect(REVERSED_QUESTIONS).toEqual([8,11,17,20]); const answers=Array(24).fill(5); expect(scoreTest(answers).map(g => g.value)).toEqual([5,4.2,4.2,3.4,5]);});
  it('rejects incomplete answers', () => expect(() => scoreTest([5])).toThrow());
  it('uses nonoverlapping bands at endpoints and fractional averages', () => {expect(profileBand(1.9)).toBe('Зона Тени');expect(profileBand(2)).toBe('Здесь есть движение');expect(profileBand(3.8)).toBe('Здесь есть движение');expect(profileBand(4)).toBe('Ресурс — опора');});
});
