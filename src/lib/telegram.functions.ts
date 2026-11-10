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
const short=(value:string,max:number)=>value.trim().slice(0,max);
export const notifyDayComplete=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({day:z.number().int().min(1).max(7),scenario:z.string().max(400),reaction:z.string().max(1500),feedback:z.string().max(3000),resource:z.string().max(800),smallStep:z.string().max(800)})).handler(async({data,context})=>{
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:link}=await supabaseAdmin.from('telegram_links').select('chat_id').eq('user_id',context.userId).eq('enabled',true).maybeSingle();
 if(!link)return {sent:false};
 const key=process.env['TELEGRAM_API_KEY_1'],gateway=process.env['LOVABLE_API_KEY'];
 if(!key||!gateway)return {sent:false};
 const parts=[`✨ День ${data.day} из 7 завершён`,data.scenario&&`Карта: ${short(data.scenario,400)}`,data.reaction&&`Моя новая реакция:\n${short(data.reaction,1500)}`,data.feedback&&`Обратная связь:\n${short(data.feedback,2000)}`,data.resource&&`Ресурс: ${short(data.resource,600)}`,data.smallStep&&`Маленький шаг: ${short(data.smallStep,600)}`].filter(Boolean);
 const text=parts.join('\n\n').slice(0,4000);
 const response=await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:link.chat_id,text,reply_markup:{inline_keyboard:[[{text:'Открыть игру',web_app:{url:'https://code-to-github-garden.lovable.app/season'}}]]}})});
 if(!response.ok){console.error('Telegram day summary',response.status,await response.text());return {sent:false};}
 return {sent:true};
});
