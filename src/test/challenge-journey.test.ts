import { beforeEach, describe, expect, it } from 'vitest';
import { canContinueJourney, emptyJourney, finishJourney, JOURNEY_STEPS, showShadeProgress } from '@/lib/challenge-journey';
import { clearChallenge, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

describe('Written challenge journey',()=>{
  beforeEach(clearChallenge);
  it('reveals shade progress only when the participant reaches shade exploration',()=>{
    expect(showShadeProgress('overview','scenario',0)).toBe(false);
    for (const step of ['scenario','reflection','story'] as const) {
      expect(showShadeProgress('day',step,0)).toBe(false);
      expect(showShadeProgress('day',step,1)).toBe(false);
    }
    for (const step of ['shadeMeaning','shadePlay','balance','resource'] as const) {
      expect(showShadeProgress('day',step,1)).toBe(true);
    }
    expect(showShadeProgress('summary','resource',1)).toBe(true);
    expect(showShadeProgress('overview','scenario',1)).toBe(true);
    expect(showShadeProgress('before','scenario',1)).toBe(false);
  });
  it('starts with the scenario and strength selection, before reflection and shade exploration',()=>{
    expect(emptyJourney().step).toBe('scenario');
    expect(JOURNEY_STEPS).toEqual(['scenario','reflection','story','shadeMeaning','shadePlay','balance','resource']);
    expect(canContinueJourney('scenario',emptyJourney())).toBe(false);
    expect(canContinueJourney('scenario',emptyJourney(),'hard')).toBe(true);
  });
  it('requires her feelings, rejected qualities, recognition and repulsion before shade exploration',()=>{
    const journey={...emptyJourney(),before:'злюсь',rejected:'давление',recognition:'молчу',repelled:'грубость'};
    expect(canContinueJourney('reflection',journey)).toBe(true);
    expect(canContinueJourney('reflection',{...journey,recognition:''})).toBe(false);
  });
  it('asks for the meaning, expression and fear of the shade before replaying it',()=>{
    const journey={...emptyJourney(),meaning:'занять место',where:'на работе',afraid:'в семье'};
    expect(canContinueJourney('shadeMeaning',journey)).toBe(true);
    expect(canContinueJourney('shadeMeaning',{...journey,meaning:''})).toBe(false);
  });
  it('keeps the chosen manifestation, own replay and after feelings separate',()=>{
    const journey={...emptyJourney(),replay:'Я тоже хочу сказать',after:'спокойнее',manifestation:'integrated' as const};
    expect(canContinueJourney('shadePlay',journey)).toBe(true);
    expect(canContinueJourney('shadePlay',{...journey,manifestation:''})).toBe(false);
  });
  it('saves before and after feelings, balance, resource and small step without four preset answers',()=>{
    const card=PLAYABLE_CARDS[0];
    if (!card) throw new Error('Missing official scenario');
    const journey={...emptyJourney(),step:'resource' as const,before:'злость',rejected:'давление',recognition:'уступаю',repelled:'грубость',meaning:'смелость',where:'на работе',afraid:'в семье',replay:'Мне тоже важно',after:'спокойствие',manifestation:'integrated' as const,balance:'прошу без давления',resource:'мой голос',smallStep:'попрошу паузу'};
    expect(finishJourney({level:'soft'},emptyJourney(),card,1,'Наглость','shade-2')).toBeNull();
    const result=finishJourney({level:'soft',choiceId:'old-choice'},journey,card,1,'Наглость','shade-2');
    if (!result) throw new Error('Valid journey rejected');
    expect(result.choiceId).toBeUndefined();
    saveChallenge({...emptyChallenge(),days:{1:result},drafts:{1:{journey}}});
    const saved=loadChallenge();
    expect(saved.days[1]?.journey).toEqual(journey);
    expect(saved.days[1]?.cardId).toBe(card.id);
    expect(saved.days[1]?.shadeId).toBe('shade-2');
    expect(saved.drafts[1]?.journey?.step).toBe('resource');
    expect(saved.days[1]?.feelings).toEqual(['злость']);
    expect(saved.days[1]?.journey?.after).toBe('спокойствие');
    expect(saved.days[1]?.resource).toBe('мой голос');
    expect(saved.days[1]?.practice).toEqual(['прошу без давления','попрошу паузу']);
  });
});