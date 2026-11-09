import { describe, expect, it } from 'vitest';
import { hasIntroCompleted } from '@/lib/season-store';

describe('Challenge entry after the introductory card', () => {
  it('does not unlock with only a name', () => {
    expect(hasIntroCompleted({name: 'Анна', days: {}})).toBe(false);
  });
  it('unlocks after finishing the first card', () => {
    expect(hasIntroCompleted({name: 'Анна', days: {1: {
      day: 1, stage: 'Девочка внутри', level: 'soft', feelings: [], body: [],
      hurt: 'Критика', shadow: 'Радость', resource: 'Отдых', doneAt: '2026-11-09T19:16:00Z',
    }}})).toBe(true);
  });
});