import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
export const notifyStory=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()})).handler(async({data,context})=>{
 const {data:story,error}=await context.supabase.from('story_submissions').select('id,user_id').eq('id',data.id).eq('user_id',context.userId).single();if(error||!story)throw new Error('Submission not found');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:roles}=await supabaseAdmin.from('user_roles').select('user_id').eq('role','admin');
 const {data:links}=await supabaseAdmin.from('telegram_links').select('chat_id').in('user_id',(roles??[]).map(item=>item.user_id)).eq('enabled',true);
 const key=process.env['TELEGRAM_API_KEY_1'],gateway=process.env['LOVABLE_API_KEY'];
 if(!key||!gateway)return {warning:'Уведомление в Telegram недоступно; администратор увидит ссылку в кабинете.'};
 if(!links?.length)return {warning:'Администратору нужно подключить уведомления в Telegram; ссылка уже доступна в кабинете.'};
 for(const link of links){const response=await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:link.chat_id,text:'Новая история ждёт проверки в кабинете администратора.',reply_markup:{inline_keyboard:[[{text:'Кабинет администратора',web_app:{url:'https://code-to-github-garden.lovable.app/admin'}}]]}})});if(!response.ok){const body=await response.text();console.error('Telegram notification',response.status,body);return {warning:`Telegram не доставил уведомление (${response.status}); ссылка сохранена.`};}const body=await response.json() as {ok:boolean;description?:string};if(!body.ok)return {warning:body.description??'Уведомление не доставлено'};}
 return {warning:''};
});
export const notifyDayComplete=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({day:z.number().int().min(1).max(7)})).handler(async({data,context})=>{
 const {data:progress,error:progressError}=await context.supabase.from('participant_progress').select('challenge').eq('user_id',context.userId).single();
 if(progressError) return {sent:false,warning:'Не удалось проверить сохранение дня. Попробуй отправить итог ещё раз.'};
 const state=progress.challenge as unknown as import('@/lib/challenge-store').ChallengeState;
 const entry=state.days?.[data.day];
 if(!entry)return {sent:false,warning:'Сначала сохрани день в аккаунте, затем отправь итог.'};
 const {data:link,error:linkError}=await context.supabase.from('telegram_links').select('chat_id').eq('user_id',context.userId).eq('enabled',true).maybeSingle();
 if(linkError)return {sent:false,warning:'Не удалось проверить подключение Telegram. Попробуй ещё раз.'};
 if(!link)return {sent:false,warning:''};
 const key=process.env['TELEGRAM_API_KEY_1'],gateway=process.env['LOVABLE_API_KEY'];
 if(!key||!gateway)return {sent:false,warning:'Telegram сейчас недоступен. День сохранён в аккаунте.'};
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const eventKey=`${state.startedAt ?? entry.doneAt}:day:${data.day}`;
 const {error:claimError}=await supabaseAdmin.from('day_notifications').insert({user_id:context.userId,event_key:eventKey});
 if(claimError){
  if(claimError.code!=='23505')return {sent:false,warning:'Не удалось подготовить уведомление. День сохранён.'};
  const {data:claimed}=await supabaseAdmin.from('day_notifications').select('status').eq('user_id',context.userId).eq('event_key',eventKey).single();
  if(claimed?.status==='sent')return {sent:true,warning:''};
  if(claimed?.status!=='failed')return {sent:false,warning:'Отправка уже началась. Проверь Telegram перед повторной попыткой.'};
  const {data:retry,error:retryError}=await supabaseAdmin.from('day_notifications').update({status:'pending'}).eq('user_id',context.userId).eq('event_key',eventKey).eq('status','failed').select('event_key');
  if(retryError||!retry?.length)return {sent:false,warning:'Отправка уже началась. Проверь Telegram.'};
 }
 const {telegramDayText}=await import('@/lib/telegram-summary');
 let response:Response;
 try{response=await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:link.chat_id,text:telegramDayText(entry),reply_markup:{inline_keyboard:[[{text:'Открыть игру',web_app:{url:'https://code-to-github-garden.lovable.app/season'}}]]}})});}
 catch{return {sent:false,warning:'Не удалось подтвердить доставку. Проверь Telegram; день сохранён в аккаунте.'};}
 const body=await response.json().catch(()=>null) as {ok?:boolean}|null;
 const sent=response.ok && body?.ok===true;
 const {error:statusError}=await supabaseAdmin.from('day_notifications').update({status:sent?'sent':'failed'}).eq('user_id',context.userId).eq('event_key',eventKey);
 if(statusError)return {sent:false,warning:'Не удалось подтвердить доставку. Проверь Telegram; день сохранён.'};
 return {sent,warning:sent?'':'Telegram не доставил итог. День сохранён; можно повторить отправку.'};
});
