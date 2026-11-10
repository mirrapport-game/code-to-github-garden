import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_THEMES } from '@/lib/demo-cards';
import { cardsForTheme } from '@/lib/official-cards';
import { cardChoices } from '@/lib/card-choices';
import { drawIntroChoices, loadIntroChoices, saveIntroChoices, introReflectionComplete } from '@/lib/intro-choices';
import { emptyChallenge, loadChallenge } from '@/lib/challenge-store';

describe('Introductory four-answer card', () => {
  beforeEach(() => window.localStorage.clear());
  it('accepts a completed first dialogue instead of a legacy four-choice answer',()=>{
    const draft={firstDialogueComplete:true,feelings:['Злость'],introReflection:{qualities:['Напористость'],notAllowed:['Напористой'],spheres:[],strength:'',fears:['Осуждения']}};
    expect(introReflectionComplete(draft)).toBe(true);
    expect(introReflectionComplete({...draft,firstDialogueComplete:false})).toBe(false);
  });
  it('requires feeling, quality, sphere and fear selections without requiring a strength answer', () => {
    const reflection = {qualities:['Резкость'],notAllowed:['Смелой'],spheres:['На работе','Дома'],strength:'',fears:['Осуждения','Обвинений']};
    const draft = {choiceId:'2',feelings:['Злость','Обида'],hurt:'Резкость',shadow:'Смелой',introReflection:reflection};
    expect(introReflectionComplete(draft)).toBe(true);
    expect(introReflectionComplete({...draft, feelings:[]})).toBe(false);
    expect(introReflectionComplete({...draft, introReflection:{...reflection,qualities:[]}})).toBe(false);
    expect(introReflectionComplete({...draft, introReflection:{...reflection,notAllowed:[]}})).toBe(false);
    expect(introReflectionComplete({...draft, introReflection:{...reflection,spheres:[]}})).toBe(true);
    expect(introReflectionComplete({...draft, introReflection:{...reflection,fears:[]}})).toBe(false);
    saveIntroChoices({theme:'Границы',cardId:cardsForTheme('Границы')[0]?.id ?? '',draft});
    expect(loadIntroChoices()?.draft).toEqual(draft);
  });
  it('restores saved self-quality selections in feminine form without losing other answers',()=>{
    const cardId=cardsForTheme('Границы')[0]?.id ?? '';
    saveIntroChoices({theme:'Границы',cardId,draft:{introReflection:{qualities:['Наглость'],notAllowed:['Наглость','Смелость'],spheres:['Дома'],strength:'Моя прежняя запись'}}});
    expect(loadIntroChoices()?.draft.introReflection?.notAllowed).toEqual(['Наглой','Смелой']);
    expect(loadIntroChoices()?.draft.introReflection?.strength).toBe('Моя прежняя запись');
  });
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