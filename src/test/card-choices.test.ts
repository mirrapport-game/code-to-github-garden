import { beforeEach, describe, expect, it } from 'vitest';
import { cardChoices } from '@/lib/card-choices';
import { DEMO_THEMES } from '@/lib/demo-cards';
import { clearChallenge, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';

describe('Four-answer challenge', () => {
  beforeEach(clearChallenge);
  it.each(DEMO_THEMES)('offers exactly four distinct answers in all three levels for %s', stage => {
    for (const level of ['soft','medium','hard'] as const) {
      const choices = cardChoices(stage, level);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map(item => item.text)).size).toBe(4);
      expect(new Set(choices.map(item => item.reflection)).size).toBe(4);
      for (const choice of choices) {
        expect(choice.recommendation.length).toBeGreaterThan(0);
        expect(choice.resource.length).toBeGreaterThan(0);
        expect(choice.smallStep.length).toBeGreaterThan(0);
      }
    }
  });
  it('preserves selected answer and level after reload', () => {
    saveChallenge({...emptyChallenge(), drafts:{1:{stage:'Слабость',level:'hard',choiceId:'3'}}});
    expect(loadChallenge().drafts[1]).toEqual({stage:'Слабость',level:'hard',choiceId:'3'});
    const draft = loadChallenge().drafts[1];
    expect(cardChoices(draft?.stage ?? '', draft?.level ?? 'soft').find(item => item.id === draft?.choiceId)?.text).toBe('Скажу: «Мне сейчас трудно. Мне важно, чтобы меня выслушали».');
  });
  it('leaves the extended season untouched when resetting the new challenge', () => {
    window.localStorage.setItem('rapport-challenge-7-v1', JSON.stringify({baseline:[3],days:{1:{hurt:'Старый ответ'}}}));
    saveChallenge(emptyChallenge());
    clearChallenge();
    expect(JSON.parse(window.localStorage.getItem('rapport-challenge-7-v1') ?? '{}').days[1].hurt).toBe('Старый ответ');
    window.localStorage.removeItem('rapport-challenge-7-v1');
  });
});