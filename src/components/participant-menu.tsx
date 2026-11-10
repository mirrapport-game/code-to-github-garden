import { Link, useLocation } from '@tanstack/react-router';
import { CalendarDays, ChartNoAxesCombined, UserRound, Bell } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useParticipant } from '@/components/participant-provider';
export function ParticipantMenu(){
  const {pathname}=useLocation();
  if(!['/season','/progress','/profile','/admin'].includes(pathname))return null;
  return <nav aria-label="Главное меню" className="challenge-theme fixed inset-x-0 bottom-0 z-40 border-t border-border bg-night text-foreground"><div className="mx-auto grid max-w-lg grid-cols-3 pb-[env(safe-area-inset-bottom)]">{([{to:'/season',label:'Сегодня',icon:CalendarDays},{to:'/progress',label:'Прогресс',icon:ChartNoAxesCombined},{to:'/profile',label:'Профиль',icon:UserRound}] as const).map(item=><Button key={item.to} asChild variant="ghost" className={`h-16 flex-col gap-1 rounded-none text-xs ${pathname===item.to?'text-gold':'text-muted-foreground'}`}><Link to={item.to} aria-current={pathname===item.to?'page':undefined}><item.icon/><span>{item.label}</span></Link></Button>)}</div></nav>;
}
export function TelegramNotifications(){
  const account=useParticipant();const [error,setError]=useState('');
  const enable=async()=>{if(!account.user){setError('Войди в профиль, чтобы привязать уведомления.');return;}const {data,error:failure}=await supabase.rpc('prepare_telegram_link');if(failure){setError(failure.message);return;}window.open(`https://t.me/RapportDa_bot?start=link_${data}`,'_blank','noopener,noreferrer');};
  return <div className="space-y-2 border-b border-border pb-5"><Button variant="ghost" className="h-auto max-w-full whitespace-normal text-gold" onClick={()=>void enable()}><Bell/>{account.telegram?'Уведомления в Telegram подключены':'Включить уведомления в Telegram'}</Button>{error&&<p role="alert" className="text-sm text-muted-foreground">{error}</p>}</div>;
}