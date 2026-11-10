import { describe, expect, it } from 'vitest';
import { SHADOW_SHADES, shadesForCard, shadeProgress } from '@/lib/shadow-shades';
import { assignDay, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

describe('Shadow shades', () => {
  it('shows all 38 remaining before a shade is revealed, even with a daily assignment', () => {
    expect(shadeProgress(assignDay(emptyChallenge(),1,()=>0))).toEqual({total:38,acquainted:0,remaining:38});
  });
  it('counts a revealed shade once across a draft and a completed day, and survives reload', () => {
    const state=assignDay(emptyChallenge(),1,()=>0);
    state.drafts[1]={journey:{step:'shadeMeaning',before:'',rejected:'',recognition:'',repelled:'',meaning:'',where:'',afraid:'',replay:'',after:'',manifestation:'',balance:'',resource:'',smallStep:''}};
    expect(shadeProgress(state)).toEqual({total:38,acquainted:1,remaining:37});
    state.days[1]={day:1,stage:'Границы',level:'soft',feelings:[],body:[],hurt:'',shadow:'',resource:'',practice:[],shadeId:state.shadeAssignments[1],doneAt:'2026-11-10T00:00:00Z'};
    saveChallenge(state);
    expect(shadeProgress(loadChallenge())).toEqual({total:38,acquainted:1,remaining:37});
  });
  it('counts distinct shades rather than completed days and ignores unknown IDs', () => {
    const state=emptyChallenge();
    const entry={day:1,stage:'Границы',level:'soft' as const,feelings:[],body:[],hurt:'',shadow:'',resource:'',practice:[],doneAt:'2026-11-10T00:00:00Z'};
    state.days={1:{...entry,shadeId:'shade-1'},2:{...entry,day:2,shadeId:'shade-1'},3:{...entry,day:3,shadeId:'shade-2'},4:{...entry,day:4,shadeId:'unknown'}};
    expect(shadeProgress(state)).toEqual({total:38,acquainted:2,remaining:36});
  });
  it('preserves all 38 supplied shades and the two boundary manifestations', () => {
    expect(SHADOW_SHADES).toHaveLength(38);
    expect(SHADOW_SHADES.find(s => s.name === 'Границы')).toMatchObject({shadow:'глухая стена или полное отсутствие границ, вторжение в чужое пространство',integrated:'гибкие, живые границы; способность защищать своё и уважать чужое.'});
  });
  it('offers multiple relevant lenses for every playable card', () => {
    for (const card of PLAYABLE_CARDS) expect(shadesForCard(card.id, 'Границы').length).toBeGreaterThan(1);
  });
  it('assigns distinct appropriate shades for seven days', () => {
    let state = emptyChallenge();
    for (let day=1; day<=7; day++) {
      state = assignDay(state,day,()=>0);
      expect(shadesForCard(state.cardAssignments[day],state.assignments[day] ?? '').map(s => s.id)).toContain(state.shadeAssignments[day]);
    }
    expect(new Set(Object.values(state.shadeAssignments)).size).toBe(7);
  });
  it('keeps the shade and reflection after reload and a new draw attempt', () => {
    const state = assignDay(emptyChallenge(),1,()=>0);
    state.drafts[1]={shadeId:state.shadeAssignments[1],shadowAnswers:['В работе','Не прошу поддержки','Попросить о паузе']};
    saveChallenge(state);
    expect(assignDay(loadChallenge(),1,()=>0.99)).toEqual(state);
  });
  it('adds a shade to an existing assignment without replacing its card', () => {
    const state = {...emptyChallenge(),assignments:{1:'Границы'},cardAssignments:{1:'society-5'}};
    const next = assignDay(state,1,()=>0);
    expect(next.cardAssignments).toEqual({1:'society-5'});
    expect(next.shadeAssignments[1]).toBeDefined();
  });
});