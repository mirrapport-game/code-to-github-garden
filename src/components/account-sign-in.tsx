import { useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import '@lovable.dev/cloud-auth-js/styles.css';
export function AccountSignIn(){
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [email,setEmail]=useState(''),[sent,setSent]=useState(false);
  const emailLogin=async()=>{setBusy(true);setError('');setSent(false);try{const {error:failure}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin+'/profile',shouldCreateUser:true}});if(failure)throw failure;setSent(true);}catch(e){setError(e instanceof Error?e.message:'Не удалось отправить письмо');}finally{setBusy(false);}};
  const login=async(provider:'google')=>{setBusy(true);setError('');try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin+'/profile'});if(result.error)setError(result.error.message);}catch(e){setError(e instanceof Error?e.message:'Не удалось войти');}finally{setBusy(false);}};
  return <section className="space-y-4 border-t border-border pt-6"><h2 className="text-2xl font-semibold">Сохрани своё знакомство с игрой</h2><p className="text-sm text-muted-foreground">После входа ответы, баллы и приглашения будут доступны с другого устройства. Организатор увидит прогресс и присланные ссылки.</p><Button className="google-sign-in w-full" disabled={busy} onClick={()=>void login('google')}><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Продолжить с Google</Button><Button className="lovable-auth-button w-full" disabled={busy} onClick={()=>void login('lovable')}>Continue with Lovable</Button>{error&&<p role="alert" className="text-destructive">{error}</p>}</section>;
}