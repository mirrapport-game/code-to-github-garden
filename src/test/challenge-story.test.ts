import { beforeEach, describe, expect, it } from 'vitest';
import { CHALLENGE_STORIES } from '@/lib/challenge-story';
import { clearChallenge, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';

describe('Daily story and personal second response', () => {
  beforeEach(clearChallenge);
  it('supplies seven daily stories with three pages each', () => {
    expect(CHALLENGE_STORIES).toHaveLength(7);
    expect(CHALLENGE_STORIES.map(story => story.pages.length)).toEqual([3,3,3,3,3,3,3]);
  });
  it('keeps the first and repeated choice and personal answer after reload', () => {
    const draft = {day:1,stage:'Границы',level:'soft' as const,choiceId:'1',revisitedChoiceId:'3',personalAnswer:'Сегодня я выбираю отдых.',storyRead:true};
    saveChallenge({...emptyChallenge(),drafts:{1:draft}});
    expect(loadChallenge().drafts[1]).toEqual(draft);
    expect(loadChallenge().drafts[1]?.choiceId).toBe('1');
    expect(loadChallenge().drafts[1]?.revisitedChoiceId).toBe('3');
    expect(loadChallenge().drafts[1]?.personalAnswer).toBe('Сегодня я выбираю отдых.');
  });
});