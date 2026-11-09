import { describe, expect, it } from 'vitest';
import { SHADOW_SHADES, shadesForCard } from '@/lib/shadow-shades';
import { assignDay, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

describe('Shadow shades', () => {
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