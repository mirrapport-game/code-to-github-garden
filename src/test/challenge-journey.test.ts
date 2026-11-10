import { beforeEach, describe, expect, it } from 'vitest';
import { canContinueJourney, emptyJourney, finishJourney, JOURNEY_STEPS, showShadeProgress, validShadeAssessment, shadeRatingChange } from '@/lib/challenge-journey';
import { clearChallenge, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

describe('Written challenge journey',()=>{
  beforeEach(clearChallenge);
  it('accepts only integer shade ratings from 1 through 10',()=>{
    expect(validShadeAssessment({mode:'scale',rating:1})).toBe(true);
    expect(validShadeAssessment({mode:'scale',rating:10})).toBe(true);
    for(const rating of [0,11,5.5,NaN]) expect(validShadeAssessment({mode:'scale',rating})).toBe(false);
  });
  it('accepts a written assessment instead of a scale and keeps both observations after reload',()=>{
    const journey={...emptyJourney(),shadeBefore:{mode:'words' as const,text:'Мне трудно просить'},shadeAfter:{mode:'words' as const,text:'Могу попросить без давления'}};
    expect(validShadeAssessment(journey.shadeBefore)).toBe(true);
    expect(validShadeAssessment({mode:'words',text:' '})).toBe(false);
    saveChallenge({...emptyChallenge(),drafts:{1:{journey}}});
    expect(loadChallenge().drafts[1]?.journey?.shadeBefore).toEqual(journey.shadeBefore);
    expect(loadChallenge().drafts[1]?.journey?.shadeAfter).toEqual(journey.shadeAfter);
  });
  it('compares numeric before and after ratings without inventing scores for written answers',()=>{
    expect(shadeRatingChange({mode:'scale',rating:3},{mode:'scale',rating:8})).toBe(5);
    expect(shadeRatingChange({mode:'scale',rating:8},{mode:'scale',rating:3})).toBe(-5);
    expect(shadeRatingChange({mode:'words',text:'Стало легче'},{mode:'scale',rating:8})).toBeNull();
  });
  it('requires a valid follow-up assessment when a baseline shade assessment exists',()=>{
    const journey={...emptyJourney(),balance:'Прошу без давления',shadeBefore:{mode:'scale' as const,rating:3}};
    expect(canContinueJourney('balance',journey)).toBe(false);
    expect(canContinueJourney('balance',{...journey,shadeAfter:{mode:'scale',rating:8}})).toBe(true);
  });
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
    expect(JOURNEY_STEPS).toEqual(['scenario','reflection','story','shadeMeaning','shadeView','shadePlay','feelings','balance','resource']);
    expect(canContinueJourney('scenario',emptyJourney())).toBe(false);
    expect(canContinueJourney('scenario',emptyJourney(),'hard')).toBe(true);
  });
  it('requires her feelings, rejected qualities, recognition and repulsion before shade exploration',()=>{
    const journey={...emptyJourney(),before:'злюсь',rejected:'давление',recognition:'молчу',repelled:'грубость'};
    expect(canContinueJourney('reflection',journey)).toBe(true);
    expect(canContinueJourney('reflection',{...journey,recognition:''})).toBe(false);
  });
  it('asks for the meaning, expression and fear of the shade before replaying it',()=>{
    const journey={...emptyJourney(),where:'на работе',afraid:'в семье',shadeBefore:{mode:'scale' as const,rating:4}};
    expect(canContinueJourney('shadeMeaning',journey)).toBe(true);
    expect(canContinueJourney('shadeMeaning',{...journey,where:''})).toBe(false);
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