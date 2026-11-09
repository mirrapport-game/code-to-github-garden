import { beforeEach, describe, expect, it } from 'vitest';
import { addDialogueTurn, nextDialogueRole } from '@/lib/intro-dialogue';
import { clearSeason, loadSeason, saveSeasonDay } from '@/lib/season-store';

describe('Participant-authored introductory dialogue', () => {
  beforeEach(clearSeason);
  it('starts with the participant and alternates without generating replies', () => {
    expect(nextDialogueRole([])).toBe('participant');
    const first = addDialogueTurn([], ' Пожалуйста, остановите здесь. ');
    expect(first).toEqual([{ role: 'participant', text: 'Пожалуйста, остановите здесь.' }]);
    expect(nextDialogueRole(first)).toBe('other');
    const second = addDialogueTurn(first, 'Здесь нельзя остановиться.');
    expect(nextDialogueRole(second)).toBe('participant');
    expect(second).toHaveLength(2);
  });
  it('does not add an empty turn', () => {
    expect(addDialogueTurn([], '   ')).toEqual([]);
  });
  it('saves the dialogue and scenario with the first card without changing challenge progress', () => {
    const dialogue = addDialogueTurn([], 'Я хочу выйти в безопасном месте.');
    saveSeasonDay({ day: 1, stage: 'В социуме', cardId: 'taxi', level: 'soft', feelings: ['страх'], body: [], hurt: '', shadow: '', resource: 'Поддержка', dialogue, doneAt: '2026-11-09T21:05:00Z' });
    expect(loadSeason().days[1]?.dialogue).toEqual(dialogue);
    expect(loadSeason().days[1]?.cardId).toBe('taxi');
    expect(Object.keys(loadSeason().days)).toEqual(['1']);
  });
});