import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { loadSeason, type SeasonState } from '@/lib/season-store';
import { loadChallenge, type ChallengeState } from '@/lib/challenge-store';
import { loadIntroChoices } from '@/lib/intro-choices';
import type { Json, Tables } from '@/integrations/supabase/types';
type Account={user:User|null;admin:boolean;loading:boolean;error:string;profile:Tables<'profiles'>|null;ledger:Tables<'points_ledger'>[];stories:Tables<'story_submissions'>[];telegram:boolean;refresh:()=>Promise<void>};
const Context=createContext<Account>({user:null,admin:false,loading:true,error:'',profile:null,ledger:[],stories:[],telegram:false,refresh:async()=>{}});
const json=(value:unknown):Json=>JSON.parse(JSON.stringify(value));
export function ParticipantProvider({children}:{children:ReactNode}) {
  const [user,setUser]=useState<User|null>(null),[admin,setAdmin]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [profile,setProfile]=useState<Tables<'profiles'>|null>(null),[ledger,setLedger]=useState<Tables<'points_ledger'>[]>([]),[stories,setStories]=useState<Tables<'story_submissions'>[]>([]),[telegram,setTelegram]=useState(false);
  const location=useLocation();
  const refresh=async()=>{
    if(!user) return;
    const [p,l,s,t,r]=await Promise.all([supabase.from('profiles').select('*').eq('id',user.id).single(),supabase.from('points_ledger').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),supabase.from('story_submissions').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),supabase.from('telegram_links').select('enabled').eq('user_id',user.id).maybeSingle(),supabase.rpc('is_game_admin')]);
    setProfile(p.data);setLedger(l.data ?? []);setStories(s.data ?? []);setTelegram(t.data?.enabled ?? false);setAdmin(r.data===true);
    const failure=p.error ?? l.error ?? s.error ?? r.error; if(failure)setError(failure.message);
  };
  useEffect(()=>{
    void supabase.auth.getUser().then(({data})=>{setUser(data.user);setLoading(false);});
    const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED','INITIAL_SESSION'].includes(event)){setUser(session?.user ?? null);setLoading(false);if(event==='SIGNED_OUT'){setAdmin(false);setProfile(null);setLedger([]);setStories([]);}}});
    const code=new URLSearchParams(window.location.search).get('ref');if(code && /^[0-9a-f-]{36}$/i.test(code))window.localStorage.setItem('rapport-referral',code);
    return ()=>data.subscription.unsubscribe();
  },[]);
  useEffect(()=>{
    if(!user)return;
    let active=true,ready=false,timer:ReturnType<typeof setTimeout>|undefined;
    const sync=async()=>{
      if(!ready || !active)return;
      const {error:failure}=await supabase.rpc('sync_game_progress',{p_intro:json(loadSeason()),p_challenge:json(loadChallenge()),p_draft:json(loadIntroChoices()),p_path:window.location.pathname,p_offset:new Date().getTimezoneOffset()});
      if(failure)setError(`Не удалось сохранить прогресс: ${failure.message}`);else {setError('');await refresh();}
    };
    const initialize=async()=>{
      const {data,error:failure}=await supabase.from('participant_progress').select('*').eq('user_id',user.id).maybeSingle();
      if(!active)return;if(failure){setError(failure.message);return;}
      const owner=window.localStorage.getItem('rapport-account-owner');
      if(data){
        const remoteIntro=data.intro as unknown as SeasonState,remoteChallenge=data.challenge as unknown as ChallengeState;
        const localIntro=loadSeason(),localChallenge=loadChallenge();
        const same=owner===user.id || !owner;
        window.localStorage.setItem('rapport-season-1',JSON.stringify(same ? {...remoteIntro,...localIntro,days:{...remoteIntro.days,...localIntro.days}} : remoteIntro));
        window.localStorage.setItem('rapport-challenge-7-v2',JSON.stringify(same && localChallenge.startedAt && (!remoteChallenge.startedAt || remoteChallenge.startedAt===localChallenge.startedAt) ? {...remoteChallenge,...localChallenge,days:{...remoteChallenge.days,...localChallenge.days},drafts:{...remoteChallenge.drafts,...localChallenge.drafts}} : remoteChallenge));
        if(data.intro_draft && (!same || !loadIntroChoices()))window.localStorage.setItem('rapport-intro-choices-v1',JSON.stringify(data.intro_draft));
        else if(!same)window.localStorage.removeItem('rapport-intro-choices-v1');
      }else if(owner && owner!==user.id){for(const key of ['rapport-season-1','rapport-challenge-7-v2','rapport-intro-choices-v1'])window.localStorage.removeItem(key);}
      window.localStorage.setItem('rapport-account-owner',user.id);
      const ref=window.localStorage.getItem('rapport-referral');if(ref){const result=await supabase.rpc('claim_game_referral',{p_code:ref});if(!result.error)window.localStorage.removeItem('rapport-referral');}
      ready=true;window.dispatchEvent(new Event('rapport-account-ready'));await sync();
    };
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>void sync(),700);};
    window.addEventListener('rapport-progress-changed',schedule);const interval=setInterval(schedule,60000);void initialize();
    return ()=>{active=false;clearTimeout(timer);clearInterval(interval);window.removeEventListener('rapport-progress-changed',schedule);};
  },[user?.id]);
  useEffect(()=>{window.dispatchEvent(new Event('rapport-progress-changed'));},[location.pathname]);
  return <Context.Provider value={{user,admin,loading,error,profile,ledger,stories,telegram,refresh}}>{children}</Context.Provider>;
}
export const useParticipant=()=>useContext(Context);