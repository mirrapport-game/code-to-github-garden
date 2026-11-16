import {useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {useParticipant} from './participant-provider';
import {Btn} from './game-ui';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {BOOKING_LABELS,bookingSchema,type BookingKind} from '@/lib/booking';
import {submitBooking} from '@/lib/booking.functions';

export function BookingActions(){
  const account=useParticipant();const submit=useServerFn(submitBooking);
  const [kind,setKind]=useState<BookingKind|null>(null),[name,setName]=useState(''),[phone,setPhone]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(''),[error,setError]=useState('');
  const [id,setId]=useState('');
  const open=(value:BookingKind)=>{setKind(value);setName(account.profile?.display_name??'');setPhone('');setResult('');setError('');setId(crypto.randomUUID());};
  return <div className="space-y-3">{(Object.keys(BOOKING_LABELS) as BookingKind[]).map(value=><Btn key={value} variant="night" onClick={()=>open(value)}>{BOOKING_LABELS[value]}</Btn>)}<Dialog open={kind!==null} onOpenChange={value=>{if(!value&&!busy)setKind(null);}}><DialogContent className="challenge-theme max-h-[90svh] overflow-y-auto"><DialogTitle>{kind?BOOKING_LABELS[kind]:''}</DialogTitle><DialogDescription>Заявка организатору</DialogDescription>{result?<p role="status">{result}</p>:<form className="space-y-4" onSubmit={async event=>{event.preventDefault();const parsed=bookingSchema.safeParse({id,name,phone,kind});if(!parsed.success){setError(parsed.error.issues[0]?.message??'Проверь поля');return;}setBusy(true);setError('');try{const response=await submit({data:parsed.data});setResult(response.warning||'Заявка отправлена организатору.');}catch(e){setError(e instanceof Error?e.message:'Не удалось отправить заявку.');}finally{setBusy(false);}}}><label className="grid gap-2">Имя<Input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} maxLength={100}/></label><label className="grid gap-2">Телефон<Input required type="tel" autoComplete="tel" placeholder="+7 …" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={40}/></label><p className="text-xs text-muted-foreground">Нажимая «Отправить заявку», ты передаёшь имя и телефон организатору для связи по выбранной услуге.</p>{error&&<p role="alert" className="text-destructive">{error}</p>}<Button type="submit" disabled={busy}>{busy?'Отправляем…':'Отправить заявку'}</Button></form>}</DialogContent></Dialog></div>;
}