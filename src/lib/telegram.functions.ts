import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
export const notifyStory=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()})).handler(async({data,context})=>{
 const {data:story,error}=await context.supabase.from('story_submissions').select('id,user_id').eq('id',data.id).eq('user_id',context.userId).single();if(error||!story)throw new Error('Submission not found');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:roles}=await supabaseAdmin.from('user_roles').select('user_id').eq('role','admin');
 const {data:links}=await supabaseAdmin.from('telegram_links').select('chat_id').in('user_id',(roles??[]).map(item=>item.user_id)).eq('enabled',true);
 const key=process.env['TELEGRAM_API_KEY'],gateway=process.env['LOVABLE_API_KEY'];
 if(!key||!gateway)return {warning:'Уведомление в Telegram недоступно; администратор увидит ссылку в кабинете.'};
 if(!links?.length)return {warning:'Администратору нужно подключить уведомления в Telegram; ссылка уже доступна в кабинете.'};
 for(const link of links){const response=await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:link.chat_id,text:'Новая история ждёт проверки в кабинете администратора.',reply_markup:{inline_keyboard:[[{text:'Кабинет администратора',web_app:{url:'https://code-to-github-garden.lovable.app/admin'}}]]}})});if(!response.ok){const body=await response.text();console.error('Telegram notification',response.status,body);return {warning:`Telegram не доставил уведомление (${response.status}); ссылка сохранена.`};}const body=await response.json() as {ok:boolean;description?:string};if(!body.ok)return {warning:body.description??'Уведомление не доставлено'};}
 return {warning:''};
});