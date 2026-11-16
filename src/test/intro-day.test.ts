import {describe, expect, it} from 'vitest';
import {newIntroDay, toggleDayFeeling, toggleDayQuality, setupComplete, dialogueComplete, persistableDay, dayContext} from '@/lib/intro-day';
import type {UIMessage} from 'ai';

describe('introductory day rules', () => {
  it('persists qualities and shadow separately before release', () => {
    const day = {...newIntroDay('family-3'), chosen_qualities: ['Резкость'], chosen_shadows: ['Резкой'], reflection_stage: 'shadow' as const};
    expect(persistableDay(day).chosen_qualities).toEqual(['Резкость']);
    expect(persistableDay(day).chosen_shadows).toEqual(['Резкой']);
    expect(persistableDay(day).reflection_stage).toBe('shadow');
    expect(dayContext(day).shadows).toEqual(['Резкой']);
  });
  it('allows unknown without combining it with identified qualities', () => {
    expect(toggleDayQuality(['Резкость'], 'Пока не знаю')).toEqual(['Пока не знаю']);
    expect(toggleDayQuality(['Пока не знаю'], 'Резкой', true)).toEqual(['Резкой']);
  });
  it('expands available emotions without losing existing selections', () => {
    expect(toggleDayFeeling(['Обида'], 'Тревога')).toEqual(['Обида', 'Тревога']);
    expect(toggleDayFeeling(['Обида'], 'Облегчение')).toEqual(['Обида', 'Облегчение']);
  });
  it('limits selections to three', () => {
    expect(toggleDayFeeling(['Обида', 'Злость', 'Стыд'], 'Страх')).toEqual(['Обида', 'Злость', 'Стыд']);
    expect(toggleDayFeeling(['Обида'], 'Обида')).toEqual([]);
  });
  it('requires all four setup answers', () => {
    expect(setupComplete(['вопрос', 'страх', 'помощь', 'дома'])).toBe(true);
    expect(setupComplete(['вопрос', 'страх', 'помощь', ' '])).toBe(false);
  });
  it('unlocks summary after three complete exchanges', () => {
    const messages: UIMessage[] = Array.from({length: 6}, (_, index) => ({id: String(index), role: index % 2 ? 'assistant' : 'user', parts: [{type: 'text', text: 'реплика'}]}));
    expect(dialogueComplete(messages.slice(0, 4))).toBe(false);
    expect(dialogueComplete(messages.slice(0, 5))).toBe(false);
    expect(dialogueComplete(messages)).toBe(true);
  });
  it('retains chosen feelings but excludes release writing from persistence and AI', () => {
    const day = {...newIntroDay('family-3'), chosen_feelings: ['Обида'], release: 'private release writing'};
    expect(persistableDay(day).chosen_feelings).toEqual(['Обида']);
    expect(JSON.stringify(persistableDay(day))).not.toContain('private release writing');
    expect(JSON.stringify(dayContext(day))).not.toContain('private release writing');
  });
  it('retains the conversation and initial feelings when repeating emotion release', () => {
    const dialogue: UIMessage[] = [{id: '1', role: 'user', parts: [{type: 'text', text: 'Я хочу тебя понять.'}]}];
    const day = {...newIntroDay('family-3'), step: 6, chosen_feelings: ['Обида'], dialogue};
    const saved = persistableDay({...day, release_method: 'mountain'});
    expect(saved.step).toBe(6);
    expect(saved.dialogue).toEqual(dialogue);
    expect(saved.chosen_feelings).toEqual(['Обида']);
  });
});