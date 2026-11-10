import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { z } from 'zod';
export const Route=createFileRoute('/api/public/jobs/telegram-reminders')({server:{handlers:{POST:async({request})=>{
 const failure=await authenticateCronRequest(request);if(failure)return failure;
 if(!z.object({kind:z.literal('daily')}).safeParse(await request.json()).success)return new Response('Invalid body',{status:400});
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const {data:links,error}=await supabaseAdmin.from('telegram_links').select('*').eq('enabled',true);
 if(error)return Response.json({error:error.message},{status:500});const key=process.env['TELEGRAM_API_KEY_1'],gateway=process.env['LOVABLE_API_KEY'];if(!key||!gateway)return new Response('Telegram unavailable',{status:503});
 const today=new Date().toISOString().slice(0,10);let sent=0;
 for(const link of links??[]){if(link.last_notified===today||!link.chat_id)continue;const {data:progress}=await supabaseAdmin.from('participant_progress').select('challenge').eq('user_id',link.user_id).maybeSingle();const challenge=progress?.challenge as {startedAt?:string;days?:Record<string,unknown>}|undefined;if(!challenge?.startedAt||Object.keys(challenge.days??{}).length>=7)continue;
 const response=await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:link.chat_id,text:'Сегодня — ещё одна встреча с собой. Твоя карта ждёт в «Раппорт: ЖиваЯ».',reply_markup:{inline_keyboard:[[{text:'Открыть сегодняшний день',web_app:{url:'https://code-to-github-garden.lovable.app/season'}}]]}})});
 if(!response.ok){const body=await response.text();console.error('Reminder',response.status,body);return Response.json({error:body},{status:response.status});}const result=await response.json() as {ok:boolean;description?:string};if(!result.ok)return Response.json({error:result.description},{status:502});await supabaseAdmin.from('telegram_links').update({last_notified:today}).eq('user_id',link.user_id);sent++;
 }return Response.json({sent});
}}}});