import { beforeEach, expect, it } from 'vitest';
import { activeRequest, requestReady } from '@/lib/challenge-request';
import { emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';
import { canContinueJourney, emptyJourney } from '@/lib/challenge-journey';

beforeEach(()=>window.localStorage.clear());
it('allows playing without a request and requires written confirmation when playing with one',()=>{
  expect(requestReady({mode:'without',method:'situation',text:'',confirmed:true})).toBe(true);
  expect(requestReady({mode:'with',method:'situation',text:' ',confirmed:true})).toBe(false);
  expect(requestReady({mode:'with',method:'situation',text:'Хочу научиться отказывать',confirmed:false})).toBe(false);
  expect(requestReady({mode:'with',method:'situation',text:'Хочу научиться отказывать',confirmed:true})).toBe(true);
});
it('persists the selected method and request without changing completed progress',()=>{
  for(const method of ['situation','pattern','character'] as const){
    saveChallenge({...emptyChallenge(),request:{mode:'with',method,text:'Я молчу, когда мне больно',confirmed:true}});
    expect(loadChallenge().request).toEqual({mode:'with',method,text:'Я молчу, когда мне больно',confirmed:true});
    expect(loadChallenge().days).toEqual({});
  }
});
it('only asks about integration for an active request and preserves its day snapshot',()=>{
  expect(activeRequest({mode:'without',method:'pattern',text:'Старый запрос',confirmed:true})).toBeUndefined();
  const journey={...emptyJourney(),requestText:'Хочу говорить о себе'};
  expect(canContinueJourney('request',journey)).toBe(false);
  expect(canContinueJourney('request',{...journey,requestReflection:'Могу назвать желание без давления'})).toBe(true);
  expect(canContinueJourney('request',emptyJourney())).toBe(true);
  saveChallenge({...emptyChallenge(),drafts:{1:{journey:{...journey,requestReflection:'Могу назвать желание без давления'}}}});
  expect(loadChallenge().drafts[1]?.journey?.requestText).toBe('Хочу говорить о себе');
});