import { Btn } from '@/components/game-ui';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { REQUEST_METHODS, type ChallengeRequest } from '@/lib/challenge-request';

export function ChallengeRequestEditor({value,onChange,onContinue,onBack}:{value:ChallengeRequest;onChange:(value:ChallengeRequest)=>void;onContinue:()=>void;onBack:()=>void}) {
  const method=REQUEST_METHODS.find(item=>item.id===value.method)??REQUEST_METHODS[0];
  return <section className="space-y-6">
    <h1 className="text-4xl font-semibold">Твой запрос к игре</h1>
    <Tabs value={value.method} onValueChange={id=>{const selected=REQUEST_METHODS.find(item=>item.id===id);if(selected)onChange({...value,method:selected.id,confirmed:false});}}>
      <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="situation" className="whitespace-normal">Ситуация</TabsTrigger><TabsTrigger value="pattern" className="whitespace-normal">Сценарий</TabsTrigger><TabsTrigger value="character" className="whitespace-normal">Персонаж</TabsTrigger></TabsList>
    </Tabs>
    <h2 className="text-2xl font-semibold">{method.title}</h2>
    <p className="leading-relaxed">{method.prompt}</p>
    <label className="block space-y-3"><span className="font-semibold">Мой запрос</span><textarea aria-label="Мой запрос" autoComplete="off" value={value.text} onChange={event=>onChange({...value,text:event.target.value,confirmed:false})} className="min-h-40 w-full rounded-lg border border-input bg-card p-4 outline-none focus:border-gold"/></label>
    <Btn disabled={!value.text.trim()} onClick={onContinue}>Продолжить с запросом</Btn>
    <Btn variant="ghost" onClick={onBack}>Назад</Btn>
  </section>;
}