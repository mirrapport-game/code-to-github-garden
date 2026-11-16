import {createServerFn} from '@tanstack/react-start';
import {bookingSchema,BOOKING_LABELS} from './booking';

export const submitBooking = createServerFn({method:'POST'}).inputValidator(bookingSchema).handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {error}=await supabaseAdmin.from('booking_requests').insert(data);
  if(error){if(error.code==='23505')return {warning:'Заявка уже сохранена.'};throw new Error('Не удалось сохранить заявку. Попробуй ещё раз.');}
  const {data:roles,error:roleError}=await supabaseAdmin.from('user_roles').select('user_id').eq('role','admin');
  const {data:links,error:linkError}=await supabaseAdmin.from('telegram_links').select('chat_id').in('user_id',(roles??[]).map(r=>r.user_id)).eq('enabled',true);
  let warning='';
  const key=process.env['TELEGRAM_API_KEY_1'],gateway=process.env['LOVABLE_API_KEY'];
  if(roleError||linkError||!links?.length||!key||!gateway)warning='Заявка сохранена. Уведомления администратора в Telegram пока не подключены.';
  else for(const link of links){
    try{
      const response=await fetch('https://connector-gateway.lovable.dev/telegram/sendMessage',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':key,'Content-Type':'application/json'},body:JSON.stringify({chat_id:link.chat_id,text:`Новая заявка: ${BOOKING_LABELS[data.kind]}\nИмя: ${data.name}\nТелефон: ${data.phone}\nhttps://code-to-github-garden.lovable.app/admin`})});
      if(!response.ok){const body=await response.text();console.error('Booking Telegram',response.status,body);warning=`Заявка сохранена, Telegram не доставил уведомление (${response.status}).`;break;}
      const body=await response.json() as {ok?:boolean;description?:string};
      if(!body.ok){warning=body.description??'Заявка сохранена, уведомление не доставлено.';break;}
    }catch{warning='Заявка сохранена; доставка в Telegram не подтверждена.';break;}
  }
  await supabaseAdmin.from('booking_requests').update({notification_status:warning?'failed':'sent',notification_warning:warning}).eq('id',data.id);
  return {warning};
});