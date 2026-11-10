import type { ChallengeState } from '@/lib/challenge-store';
import type { SeasonState } from '@/lib/season-store';
import { unlockAt } from '@/lib/challenge';
import { integrationProfile, integrationReactions } from '@/lib/intro-integration';
import { SHADOW_SHADES } from '@/lib/shadow-shades';
export const POINTS = {day:50,missed:-50,referral:100,story:50};
export function dayTrack(state:ChallengeState,now=new Date()) {
  return Array.from({length:7},(_,i)=>{
    const day=i+1,start=unlockAt(state,day),end=start ? new Date(start) : null;
    end?.setDate(end.getDate()+1);
    const entry=state.days[day];
    const missed=Boolean(end && now>=end && (!entry || new Date(entry.doneAt)>=end));
    return {day,missed,completed:Boolean(entry),status:entry ? missed ? 'late' : 'done' : missed ? 'missed' : start && now>=start ? 'today' : 'locked',points:(entry ? POINTS.day:0)+(missed?POINTS.missed:0)};
  });
}
export function localDayPoints(state:ChallengeState,now=new Date()) {return dayTrack(state,now).reduce((sum,item)=>sum+item.points,0);}
export type ShadowTrack = {key:string;name:string;source:string;integrated:boolean;before:string;after:string;shadow:string;balanced:string;resource:string;smallStep:string};
export function shadowTracker(intro:SeasonState,challenge:ChallengeState):ShadowTrack[] {
  const result:ShadowTrack[]=[];
  for(const entry of Object.values(intro.days)) {
    for(const quality of entry.introReflection?.notAllowed ?? []) {
      const profile=integrationProfile(quality); if(!profile) continue;
      const value=entry.introIntegration?.quality===quality ? entry.introIntegration : undefined;
      const reaction=integrationReactions(quality).find(item=>item.id===value?.reactionId);
      result.push({key:`intro:${entry.cardId}:${quality}`,name:profile.name,source:'Первая карта',integrated:Boolean(value?.feedback?.trim() && value.dialogue?.some(turn=>turn.role==='participant')) || (value?.step==='summary' && reaction?.kind==='integrated'),before:entry.feelings.join(', '),after:value?.after ?? '',shadow:profile.shadow,balanced:profile.integrated,resource:value?.resource ?? '',smallStep:value?.smallStep ?? ''});
    }
  }
  for(const [day,entry] of Object.entries({...challenge.drafts,...challenge.days})) {
    const journey=entry.journey;
    const shade=SHADOW_SHADES.find(item=>item.id===(entry.shadeId ?? challenge.shadeAssignments[Number(day)]));
    if(!shade || !journey || !['shadeMeaning','shadeView','shadePlay','feelings','balance','resource'].includes(journey.step)) continue;
    result.push({key:`day:${day}`,name:shade.name,source:`День ${day}`,integrated:Boolean(challenge.days[Number(day)]) && journey.manifestation==='integrated',before:journey.before,after:journey.after,shadow:shade.shadow,balanced:shade.integrated,resource:journey.resource,smallStep:journey.smallStep});
  }
  return result;
}