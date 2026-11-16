import { beforeEach, describe, expect, it } from 'vitest';
import { canContinueJourney, emptyJourney, finishJourney, JOURNEY_STEPS, showShadeProgress } from '@/lib/challenge-journey';
import { clearChallenge, emptyChallenge, loadChallenge, saveChallenge } from '@/lib/challenge-store';
import { PLAYABLE_CARDS } from '@/lib/official-cards';

const selected = (...items: string[]) => items.join(', ');

describe('Selection-only challenge journey',()=>{
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
  it('starts with the explanation before the card, reflection and shade exploration',()=>{
    expect(emptyJourney().step).toBe('story');
    expect(JOURNEY_STEPS.slice(0,6)).toEqual(['story','scenario','reflection','shadeMeaning','shadeView','shadePlay']);
    expect(canContinueJourney('scenario',emptyJourney())).toBe(false);
    expect(canContinueJourney('scenario',emptyJourney(),'hard')).toBe(true);
  });
  it('allows the card without an AI dialogue in reflection mode',()=>{
    const journey={...emptyJourney(),practiceMode:'reflection' as const,firstDialogueComplete:false};
    expect(canContinueJourney('scenario',journey,'soft')).toBe(true);
    expect(canContinueJourney('scenario',journey)).toBe(false);
  });
  it('finishes reflection with feelings and shade integration without dialogues or resource steps',()=>{
    const card=PLAYABLE_CARDS[0];
    if(!card)throw new Error('Missing scenario');
    const journey={...emptyJourney(),practiceMode:'reflection' as const,firstDialogueComplete:false,before:'Злость',rejected:'Наглость, Холодность, Контроль',recognition:'Семья',where:'Семья',afraid:'Дружба',manifestation:'integrated' as const,afterFeelings:['Лёгкость'],after:'Лёгкость'};
    expect(finishJourney({level:'soft'},journey,card,1,'Границы')).not.toBeNull();
    expect(finishJourney({level:'soft'},{...journey,manifestation:''},card,1,'Границы')).toBeNull();
    expect(finishJourney({level:'soft'},{...journey,afterFeelings:[]},card,1,'Границы')).toBeNull();
  });
  it('requires the first AI dialogue for new days while retaining saved legacy choices',()=>{
    expect(canContinueJourney('scenario',{...emptyJourney(),firstDialogueComplete:false},'soft')).toBe(false);
    expect(canContinueJourney('scenario',{...emptyJourney(),firstDialogueComplete:true},'soft')).toBe(true);
    expect(canContinueJourney('scenario',{...emptyJourney(),firstReactionId:'clear'},'soft')).toBe(true);
  });
  it('finishes an AI day without duplicate feelings, resource or seed steps',()=>{
    const card=PLAYABLE_CARDS[0];
    if (!card) throw new Error('Missing scenario');
    const journey={...emptyJourney(),firstDialogueComplete:true,before:'Злость',rejected:'Наглость, Холодность, Контроль',recognition:'Семья',where:'Семья',afraid:'Дружба',feedback:'Ты обозначила границу.',replay:'Мне это не подходит.'};
    expect(finishJourney({level:'soft'},journey,card,1,'Границы')).not.toBeNull();
    expect(finishJourney({level:'soft'},{...journey,feedback:''},card,1,'Границы')).toBeNull();
  });
  it('requires feelings, 3–5 listed qualities and listed spheres before shade exploration',()=>{
    const journey={...emptyJourney(),before:'Злость',rejected:selected('Наглость','Холодность','Контроль'),recognition:selected('Семья')};
    expect(canContinueJourney('reflection',journey)).toBe(true);
    expect(canContinueJourney('reflection',{...journey,before:''})).toBe(false);
    expect(canContinueJourney('reflection',{...journey,rejected:selected('Наглость','Контроль')})).toBe(false);
    expect(canContinueJourney('reflection',{...journey,rejected:selected('Наглость','Холодность','Контроль','Лживость','Ревность','Упрямство')})).toBe(false);
    expect(canContinueJourney('reflection',{...journey,rejected:selected('Наглость','Холодность','Моё качество')})).toBe(false);
    expect(canContinueJourney('reflection',{...journey,recognition:''})).toBe(false);
  });
  it('asks for the spheres where the shade shows up and where it is feared, from the list only',()=>{
    const journey={...emptyJourney(),where:selected('Работа и карьера'),afraid:selected('Семья','Дружба')};
    expect(canContinueJourney('shadeMeaning',journey)).toBe(true);
    expect(canContinueJourney('shadeMeaning',{...journey,where:''})).toBe(false);
    expect(canContinueJourney('shadeMeaning',{...journey,afraid:'в семье'})).toBe(false);
  });
  it('requires a chosen reaction and after feelings, with no free text',()=>{
    expect(canContinueJourney('shadePlay',emptyJourney())).toBe(false);
    expect(canContinueJourney('shadePlay',{...emptyJourney(),reactionId:'clear'})).toBe(true);
    expect(canContinueJourney('shadePlay',{...emptyJourney(),reactionId:'unknown'})).toBe(false);
    expect(canContinueJourney('feelings',{...emptyJourney(),reactionId:'clear'})).toBe(false);
    expect(canContinueJourney('feelings',{...emptyJourney(),reactionId:'clear',afterFeelings:['Лёгкость']})).toBe(true);
  });
  it('requires the seed selections before the day summary',()=>{
    const journey={...emptyJourney(),resource:'мой голос',smallStep:'попрошу паузу'};
    expect(canContinueJourney('resource',journey)).toBe(false);
    expect(canContinueJourney('resource',{...journey,seedGood:['Я заметила своё чувство и не отмахнулась от него']})).toBe(false);
    expect(canContinueJourney('resource',{...journey,seedGood:['Я заметила своё чувство и не отмахнулась от него'],seedAction:'Сказать «нет» в одной безопасной ситуации на этой неделе'})).toBe(true);
  });
  it('saves a completed day built only from selections and keeps it after reload',()=>{
    const card=PLAYABLE_CARDS[0];
    if (!card) throw new Error('Missing official scenario');
    const journey={...emptyJourney(),step:'resource' as const,before:'Злость, Страх',rejected:selected('Наглость','Холодность','Контроль'),recognition:selected('Семья','Дружба'),where:selected('Работа и карьера'),afraid:selected('Семья'),reactionId:'clear',replay:'Спокойно скажу, где моя граница',manifestation:'integrated' as const,afterFeelings:['Лёгкость'],after:'Лёгкость',resource:'мой голос',smallStep:'попрошу паузу',seedGood:['Я заметила своё чувство и не отмахнулась от него'],seedAction:'Сказать «нет» в одной безопасной ситуации на этой неделе'};
    expect(finishJourney({level:'soft'},emptyJourney(),card,1,'Наглость','shade-2')).toBeNull();
    const result=finishJourney({level:'soft'},journey,card,1,'Наглость','shade-2');
    if (!result) throw new Error('Valid journey rejected');
    saveChallenge({...emptyChallenge(),days:{1:result},drafts:{1:{journey}}});
    const saved=loadChallenge();
    expect(saved.days[1]?.journey).toEqual(journey);
    expect(saved.days[1]?.cardId).toBe(card.id);
    expect(saved.days[1]?.shadeId).toBe('shade-2');
    expect(saved.days[1]?.feelings).toEqual(['Злость','Страх']);
    expect(saved.days[1]?.practice).toContain('Сказать «нет» в одной безопасной ситуации на этой неделе');
  });
  it('keeps the request reflection as the only free-text answer',()=>{
    const journey={...emptyJourney(),requestText:'Хочу просить о помощи'};
    expect(canContinueJourney('request',journey)).toBe(false);
    expect(canContinueJourney('request',{...journey,requestReflection:'Могу назвать желание без давления'})).toBe(true);
    expect(canContinueJourney('request',emptyJourney())).toBe(true);
  });
});
