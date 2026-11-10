import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { loadSeason } from '@/lib/season-store';
import { loadChallenge } from '@/lib/challenge-store';
import { loadIntroChoices } from '@/lib/intro-choices';
import { mergeProgress, type ProgressSnapshot } from '@/lib/progress-sync';
import type { Json, Tables } from '@/integrations/supabase/types';
type Account={user:User|null;admin:boolean;loading:boolean;error:string;profile:Tables<'profiles'>|null;ledger:Tables<'points_ledger'>[];stories:Tables<'story_submissions'>[];telegram:boolean;refresh:()=>Promise<void>;flush:()=>Promise<boolean>};
const Context=createContext<Account>({user:null,admin:false,loading:true,error:'',profile:null,ledger:[],stories:[],telegram:false,refresh:async()=>{},flush:async()=>false});
const json=(value:unknown):Json=>JSON.parse(JSON.stringify(value));
const snapshot=():ProgressSnapshot=>({intro:loadSeason(),challenge:loadChallenge(),intro_draft:loadIntroChoices()});
const write=(value:ProgressSnapshot)=>{
  window.localStorage.setItem('rapport-season-1',JSON.stringify(value.intro));
  window.localStorage.setItem('rapport-challenge-7-v2',JSON.stringify(value.challenge));
  if(value.intro_draft)window.localStorage.setItem('rapport-intro-choices-v1',JSON.stringify(value.intro_draft));
  else window.localStorage.removeItem('rapport-intro-choices-v1');
};
export function ParticipantProvider({children}:{children:ReactNode}) {
  const [user,setUser]=useState<User|null>(null),[admin,setAdmin]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [profile,setProfile]=useState<Tables<'profiles'>|null>(null),[ledger,setLedger]=useState<Tables<'points_ledger'>[]>([]),[stories,setStories]=useState<Tables<'story_submissions'>[]>([]),[telegram,setTelegram]=useState(false);
  const currentUser=useRef<string|null>(null),refreshVersion=useRef(0),flushRef=useRef<()=>Promise<boolean>>(async()=>false);
  const location=useLocation();
  const refresh=async()=>{
    if(!user)return;
    const id=user.id,version=++refreshVersion.current;
    const [p,l,s,t,r]=await Promise.all([supabase.from('profiles').select('*').eq('id',id).single(),supabase.from('points_ledger').select('*').eq('user_id',id).order('created_at',{ascending:false}),supabase.from('story_submissions').select('*').eq('user_id',id).order('created_at',{ascending:false}),supabase.from('telegram_links').select('enabled').eq('user_id',id).maybeSingle(),supabase.rpc('is_game_admin')]);
    if(currentUser.current!==id || refreshVersion.current!==version)return;
    const failure=p.error ?? l.error ?? s.error ?? t.error ?? r.error;
    if(failure){setError(`Не удалось обновить профиль: ${failure.message}`);return;}
    setProfile(p.data);setLedger(l.data ?? []);setStories(s.data ?? []);setTelegram(t.data?.enabled ?? false);setAdmin(r.data===true);setError('');
  };
  useEffect(()=>{
    const accept=(value:User|null)=>{currentUser.current=value?.id ?? null;setUser(value);setLoading(false);};
    void supabase.auth.getUser().then(({data})=>accept(data.user));
    const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED','INITIAL_SESSION'].includes(event))accept(session?.user ?? null);});
    const code=new URLSearchParams(window.location.search).get('ref');if(code && /^[0-9a-f-]{36}$/i.test(code))window.localStorage.setItem('rapport-referral',code);
    return ()=>data.subscription.unsubscribe();
  },[]);
  useEffect(()=>{
    setAdmin(false);setProfile(null);setLedger([]);setStories([]);setTelegram(false);setError('');refreshVersion.current++;
    if(!user){flushRef.current=async()=>false;return;}
    let active=true,ready=false,timer:ReturnType<typeof setTimeout>|undefined,running:Promise<boolean>|null=null,dirty=false;
    const baseKey=`rapport-sync-base:${user.id}`;
    let base:ProgressSnapshot|null=null;
    const sync=():Promise<boolean>=>{
      dirty=true;
      if(running)return running;
      if(!ready || !active)return Promise.resolve(false);
      running=(async()=>{
        while(dirty && active){
          dirty=false;
          const sent=snapshot();
          const {data,error:failure}=await supabase.rpc('sync_game_progress_safe',{p_intro:json(sent.intro),p_challenge:json(sent.challenge),p_draft:json(sent.intro_draft),p_base:json(base ?? {}),p_path:window.location.pathname,p_offset:new Date().getTimezoneOffset()});
          if(!active)return false;
          if(failure || !data){setError(`Не удалось сохранить прогресс: ${failure?.message ?? 'попробуй ещё раз'}`);return false;}
          const remote=data as unknown as ProgressSnapshot;
          const current=snapshot();
          const merged=mergeProgress(sent,remote,current) as ProgressSnapshot;
          write(merged);base=remote;window.localStorage.setItem(baseKey,JSON.stringify(base));
          if(JSON.stringify(merged)!==JSON.stringify(remote))dirty=true;
          if(JSON.stringify(current)!==JSON.stringify(merged))window.dispatchEvent(new Event('rapport-account-ready'));
        }
        setError('');await refresh();return true;
      })().catch(()=>{if(active)setError('Не удалось сохранить прогресс. Ответы остались в этом браузере; попробуй ещё раз.');return false;}).finally(()=>{running=null;});
      return running;
    };
    const initialize=async()=>{
      try{
        const {data,error:failure}=await supabase.from('participant_progress').select('*').eq('user_id',user.id).maybeSingle();
        if(!active)return;if(failure){setError(failure.message);return;}
        const owner=window.localStorage.getItem('rapport-account-owner'),same=owner===user.id || !owner;
        try{base=JSON.parse(window.localStorage.getItem(baseKey) ?? 'null');}catch{base=null;}
        if(data){const remote:ProgressSnapshot={intro:data.intro,challenge:data.challenge,intro_draft:data.intro_draft};write(same ? mergeProgress(base,snapshot(),remote) as ProgressSnapshot : remote);base=remote;}
        else if(!same){for(const key of ['rapport-season-1','rapport-challenge-7-v2','rapport-intro-choices-v1'])window.localStorage.removeItem(key);}
        window.localStorage.setItem('rapport-account-owner',user.id);
        const ref=window.localStorage.getItem('rapport-referral');if(ref){const result=await supabase.rpc('claim_game_referral',{p_code:ref});if(!result.error)window.localStorage.removeItem('rapport-referral');}
        ready=true;window.dispatchEvent(new Event('rapport-account-ready'));await sync();
      }catch{if(active)setError('Не удалось загрузить профиль. Попробуй обновить страницу; ответы в этом браузере сохранены.');}
    };
    const schedule=()=>{dirty=true;clearTimeout(timer);timer=setTimeout(()=>void sync(),700);};
    const flush=async()=>{clearTimeout(timer);return sync();};flushRef.current=flush;
    window.addEventListener('rapport-progress-changed',schedule);window.addEventListener('focus',schedule);
    const interval=setInterval(schedule,60000);void initialize();
    return ()=>{active=false;flushRef.current=async()=>false;clearTimeout(timer);clearInterval(interval);window.removeEventListener('rapport-progress-changed',schedule);window.removeEventListener('focus',schedule);};
  },[user?.id]);
  useEffect(()=>{window.dispatchEvent(new Event('rapport-progress-changed'));},[location.pathname]);
  return <Context.Provider value={{user,admin,loading,error,profile,ledger,stories,telegram,refresh,flush:()=>flushRef.current()}}>{children}</Context.Provider>;
}
export const useParticipant=()=>useContext(Context);
