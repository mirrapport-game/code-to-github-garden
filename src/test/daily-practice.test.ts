import {describe, it, expect} from 'vitest';
import {assignPractice, practiceStatus, practiceReflectionReady} from '@/lib/daily-practice';
import type {SeasonState, DayAnswer} from '@/lib/season-store';
const first = new Date(2026, 10, 13, 15);
const answer = (day: number): DayAnswer => ({day, stage:'Семья', level:'soft', feelings:['Обида'], body:[], hurt:'', shadow:'', resource:'', cardId:`card-${day}`, doneAt:first.toISOString()});
describe('seven daily introductory cards', () => {
  it('requires both daily answers with a request but neither without a request', () => {
    expect(practiceReflectionReady('Хочу взаимопонимания','Связано с разговором','')).toBe(false);
    expect(practiceReflectionReady('Хочу взаимопонимания','','Спрошу спокойно')).toBe(false);
    expect(practiceReflectionReady('Хочу взаимопонимания','Связано с разговором','Спрошу спокойно')).toBe(true);
    expect(practiceReflectionReady(undefined,'','')).toBe(true);
  });
  it('opens day 1 immediately and day 2 only on the following calendar day', () => {
    const state = assignPractice({name:'',days:{}}, ['card-1','card-2'], first, () => 0);
    expect(practiceStatus(state, first)).toMatchObject({day:1,unlocked:true});
    const done = {...state, days:{1:answer(1)}};
    expect(practiceStatus(done, first)).toMatchObject({day:2,unlocked:false});
    expect(practiceStatus(done, new Date(2026,10,14,0,1))).toMatchObject({day:2,unlocked:true});
  });
  it('retains assignments and draws another official card without repeats', () => {
    const state = assignPractice({name:'',days:{1:answer(1)}}, ['card-1','card-2','card-3'], new Date(2026,10,14), () => 0);
    expect(state.dailyPractice?.assignments[2]).toBe('card-2');
    expect(assignPractice(state,['card-1','card-2','card-3'],new Date(2026,10,14),()=>0.99)).toEqual(state);
  });
  it('allows only one card per day even after missed days', () => {
    const now = new Date(2026,10,20,15);
    const state: SeasonState = {name:'',days:{1:answer(1),2:{...answer(2),doneAt:now.toISOString()}}};
    expect(practiceStatus(state,now)).toMatchObject({day:3,unlocked:false});
    expect(practiceStatus(state,new Date(2026,10,21))).toMatchObject({day:3,unlocked:true});
  });
  it('ends after seven completed days and does not open an eighth card', () => {
    const state: SeasonState = {name:'',days:Object.fromEntries(Array.from({length:7},(_,i)=>[i+1,answer(i+1)]))};
    expect(practiceStatus(state,new Date(2026,10,21))).toMatchObject({finished:true,unlocked:false,completed:[1,2,3,4,5,6,7]});
    expect(assignPractice(state,['new'],new Date(2026,10,21))).toEqual(state);
  });
});