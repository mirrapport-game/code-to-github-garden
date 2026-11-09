import { describe, expect, it } from 'vitest';
import { hasThemeAnswers, THEME_REFLECTIONS } from '@/lib/theme-reflection';
import { DEMO_THEMES } from '@/lib/demo-cards';

describe('Personal theme reflection', () => {
  it('covers every challenge theme', () => {
    expect(Object.keys(THEME_REFLECTIONS)).toEqual(DEMO_THEMES);
  });
  it('requires three personal answers before reflection', () => {
    expect(hasThemeAnswers({topicAnswers: ['Усталость', 'На работе']})).toBe(false);
    expect(hasThemeAnswers({topicAnswers: ['Усталость', 'На работе', '  ']})).toBe(false);
    expect(hasThemeAnswers({topicAnswers: ['Усталость', 'На работе', 'Просить']})).toBe(true);
  });
});