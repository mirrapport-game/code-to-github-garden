import { describe, expect, it } from 'vitest';
import { CHALLENGE_QUALITIES, CHALLENGE_SPHERES, SEED_ACTIONS, SEED_GOODS, scenarioReaction, scenarioReactions } from '@/lib/challenge-reflection';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

const themes = ['Границы','Просьба о помощи','Влияние','Дистанция','Слабость','Наглость','Жертва','Манипуляция','Холодность'];

describe('Challenge reflection lists',()=>{
  it('offers a neutral ready-made list of 15–20 qualities',()=>{
    expect(CHALLENGE_QUALITIES.length).toBeGreaterThanOrEqual(15);
    expect(CHALLENGE_QUALITIES.length).toBeLessThanOrEqual(20);
    expect(new Set(CHALLENGE_QUALITIES).size).toBe(CHALLENGE_QUALITIES.length);
  });
  it('offers a ready-made list of 10–14 life spheres',()=>{
    expect(CHALLENGE_SPHERES.length).toBeGreaterThanOrEqual(10);
    expect(CHALLENGE_SPHERES.length).toBeLessThanOrEqual(14);
    expect(new Set(CHALLENGE_SPHERES).size).toBe(CHALLENGE_SPHERES.length);
  });
  it('offers ready-made seed items for the closing block',()=>{
    expect(SEED_GOODS.length).toBeGreaterThanOrEqual(3);
    expect(SEED_ACTIONS.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Scenario-specific reactions',()=>{
  it('gives each of the nine themes its own reading that names the scene',()=>{
    const card = PLAYABLE_CARDS[0];
    if (!card) throw new Error('Missing official scenario');
    const readings = new Set<string>();
    for (const theme of themes) {
      const reading = scenarioReaction(card, 'soft', theme);
      expect(reading).toContain(card.scenario);
      readings.add(reading.replace(card.scenario, ''));
    }
    expect(readings.size).toBe(themes.length);
  });
  it('gives each theme four reaction options tied to the scene, not a shared template',()=>{
    const card = PLAYABLE_CARDS[0];
    if (!card) throw new Error('Missing official scenario');
    const perTheme = new Set<string>();
    for (const theme of themes) {
      const options = scenarioReactions(card, 'Напористость', 'говорить прямо', theme);
      expect(options.map(option => option.id)).toEqual(['pressure','clear','hide','pause']);
      for (const option of options) expect(option.text).toContain(card.scenario.replace(/[«»]/g, ''));
      perTheme.add(options.map(option => option.text).join('|'));
    }
    expect(perTheme.size).toBe(themes.length);
  });
  it('varies the reading by chosen partner intensity',()=>{
    const card = PLAYABLE_CARDS[0];
    if (!card) throw new Error('Missing official scenario');
    const soft = scenarioReaction(card, 'soft', 'Границы');
    const hard = scenarioReaction(card, 'hard', 'Границы');
    expect(soft).not.toBe(hard);
    for (const level of ['soft','medium','hard'] as const) expect(scenarioReaction(card, level, 'Границы')).toContain(card.scenario);
  });
});
