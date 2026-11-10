import { createFileRoute } from '@tanstack/react-router';
import { createHash,timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import cover from '@/assets/telegram/rapport-bot-cover.jpg.asset.json';
const updateSchema=z.object({update_id:z.number().int(),message:z.object({text:z.string().max(4096).optional(),chat:z.object({id:z.number().int(),type:z.string()})}).optional()});
export const Route=createFileRoute('/api/public/telegram/webhook')({server:{handlers:{POST:async({request})=>{
 const key=process.env['TELEGRAM_API_KEY_1'],gateway=process.env['LOVABLE_API_KEY'];if(!key||!gateway)return new Response('Not configured',{status:503});
 const expected=createHash('sha256').update(`telegram-webhook:${key}`).digest('base64url'),actual=request.headers.get('X-Telegram-Bot-Api-Secret-Token')??'';
 if(actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return new Response('Unauthorized',{status:401});
 const parsed=updateSchema.safeParse(await request.json());if(!parsed.success)return new Response('Invalid update',{status:400});const message=parsed.data.message;if(!message||message.chat.type!=='private')return Response.json({ok:true});
 const match=message.text?.match(/^\/start link_([0-9a-f-]{36})$/i);
 if(match){const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const {error}=await supabaseAdmin.from('telegram_links').update({chat_id:message.chat.id,enabled:true}).eq('link_code',match[1]??'').eq('enabled',false);if(error)return Response.json({error:error.message},{status:500});}
 const response=await fetch('https://connector-gateway.lovable.dev/telegram/sendPhoto',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:message.chat.id,photo:`https://code-to-github-garden.lovable.app${cover.url}`,caption:match?'Уведомления подключены. Открой «Раппорт: ЖиваЯ».':'Раппорт: ЖиваЯ — ближе к себе, ближе к другим.\n\nВытяни первую карту, прислушайся к чувствам и попробуй новую реакцию. Затем — 7 дней знакомства с игрой.\n\nЭто игра-зеркало, не психотерапия.',reply_markup:{inline_keyboard:[[{text:'Вытянуть первую карту',web_app:{url:'https://code-to-github-garden.lovable.app'}}]]}})});
 if(!response.ok){const body=await response.text();console.error('Telegram webhook',response.status,body);return Response.json({error:body},{status:response.status});}return Response.json({ok:true});
}}}});