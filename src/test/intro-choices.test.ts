import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_THEMES } from '@/lib/demo-cards';
import { cardsForTheme } from '@/lib/official-cards';
import { cardChoices } from '@/lib/card-choices';
import { drawIntroChoices, loadIntroChoices, saveIntroChoices } from '@/lib/intro-choices';
import { emptyChallenge, loadChallenge } from '@/lib/challenge-store';

describe('Introductory four-answer card', () => {
  beforeEach(() => window.localStorage.clear());
  it('randomly assigns each of the nine themes with a matching official scenario', () => {
    DEMO_THEMES.forEach((theme, index) => {
      const assignment = drawIntroChoices(() => (index + 0.1) / 9);
      expect(assignment?.theme).toBe(theme);
      expect(cardsForTheme(theme).some(card => card.id === assignment?.cardId)).toBe(true);
      const choices = cardChoices(theme, 'soft', assignment?.cardId);
      expect(choices).toHaveLength(4);
      expect(choices.map(choice => choice.id)).toEqual(['1', '2', '3', '4']);
    });
  });
  it('preserves the random topic and answer without assigning any challenge days', () => {
    const assignment = drawIntroChoices(() => 0.5);
    if (!assignment) throw new Error('Expected an introductory card');
    saveIntroChoices({...assignment, draft: {level: 'medium', choiceId: '3'}});
    expect(loadIntroChoices()).toEqual({...assignment, draft: {level: 'medium', choiceId: '3'}});
    expect(loadChallenge()).toEqual(emptyChallenge());
  });
});