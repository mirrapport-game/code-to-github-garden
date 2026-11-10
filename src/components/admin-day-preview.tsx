import { useState } from 'react';
import { ChallengeJourney } from '@/components/challenge-journey';
import { ChallengeDaySummary } from '@/components/challenge-day-summary';
import { Button } from '@/components/ui/button';
import { assignDay,emptyChallenge,type ChallengeAnswer } from '@/lib/challenge-store';
import { emptyJourney,JOURNEY_STEPS } from '@/lib/challenge-journey';
import { PLAYABLE_CARDS } from '@/lib/official-cards';
export function AdminDayPreview({day}:{day:number}){
 const [assignment]=useState(()=>assignDay(emptyChallenge(),day));
 const [draft,setDraft]=useState<Partial<ChallengeAnswer>>({journey:emptyJourney()}),[summary,setSummary]=useState<ChallengeAnswer|null>(null);
 const card=PLAYABLE_CARDS.find(item=>item.id===assignment.cardAssignments[day]);if(!card)return null;
 return <div className="space-y-5 border-t border-border pt-5"><div className="flex flex-wrap gap-2">{JOURNEY_STEPS.map((step,index)=><Button key={step} variant="outline" onClick={()=>{setSummary(null);setDraft({...draft,journey:{...emptyJourney(),...draft.journey,step}});}}>{['Сценарий','Рефлексия','История','Тень','Отыгрыш','Баланс','Ресурс'][index]}</Button>)}</div>{summary?<ChallengeDaySummary answer={summary}/>:<ChallengeJourney key={`${day}:${draft.journey?.step}`} day={day} card={card} theme={assignment.assignments[day]??card.stage} shadeId={assignment.shadeAssignments[day]} draft={draft} onDraft={setDraft} onComplete={setSummary}/>}</div>;
}