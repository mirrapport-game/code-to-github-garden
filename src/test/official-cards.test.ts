import { describe, expect, it } from 'vitest';
import { OFFICIAL_CARDS, PLAYABLE_CARDS, cardsForTheme } from '@/lib/official-cards';
import { assignDay, emptyChallenge, saveChallenge, loadChallenge } from '@/lib/challenge-store';
import { DEMO_THEMES } from '@/lib/demo-cards';

describe('Original card library', () => {
  it('imports every numbered scenario from the document', () => {
    expect(OFFICIAL_CARDS).toHaveLength(134);
    expect(new Set(OFFICIAL_CARDS.map(c => c.id)).size).toBe(134);
  });
  it('does not invent missing source levels', () => {
    expect(OFFICIAL_CARDS.find(c => c.id === 'inner-girl-8')?.levels.hard.text).toBe('');
    expect(PLAYABLE_CARDS.some(c => c.id === 'inner-girl-8')).toBe(false);
    expect(PLAYABLE_CARDS.some(c => c.id === 'society-7')).toBe(false);
  });
  it.each(DEMO_THEMES)('links %s to complete original cards', theme => {
    expect(cardsForTheme(theme).length).toBeGreaterThan(0);
    expect(cardsForTheme(theme).every(c => c.source === 'official' && c.cover)).toBe(true);
  });
  it('keeps seven random concepts and scenario IDs distinct and stable on reload', () => {
    let state = emptyChallenge();
    for (let day=1;day<=7;day++) state=assignDay(state,day,()=>0);
    expect(new Set(Object.values(state.assignments)).size).toBe(7);
    expect(new Set(Object.values(state.cardAssignments)).size).toBe(7);
    saveChallenge(state);
    expect(assignDay(loadChallenge(),1,()=>0.99).cardAssignments).toEqual(state.cardAssignments);
  });
});