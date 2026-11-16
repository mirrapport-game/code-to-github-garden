import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { loadSeason } from '@/lib/season-store';
import { practiceStatus } from '@/lib/daily-practice';
import { TelegramNotifications } from '@/components/participant-menu';
export const Route = createFileRoute('/progress')({head:()=>({meta:[{title:'Мои ежедневные карты — Раппорт: ЖиваЯ'},{name:'description',content:'Семь дней игры: завершённые карты, чувства и диалоги.'},{property:'og:title',content:'Мои ежедневные карты — Раппорт: ЖиваЯ'},{property:'og:description',content:'Личная статистика ежедневных карт и сохранённые итоги.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Progress});
function Progress() {
 const [data,setData] = useState<ReturnType<typeof loadSeason> | null>(null);
 useEffect(()=>{const update=()=>setData(loadSeason());update();window.addEventListener('rapport-account-ready',update);window.addEventListener('rapport-progress-changed',update);return()=>{window.removeEventListener('rapport-account-ready',update);window.removeEventListener('rapport-progress-changed',update);};},[]);
 if (!data) return null;
 const status = practiceStatus(data);
 const answers = status.completed.flatMap(day => {const entry = data.days[day]; return entry ? [entry] : [];});
 const replies = answers.reduce((sum,day)=>sum+(day.dialogue?.filter(turn=>turn.role==='participant').length ?? 0),0);
 return <main className="challenge-theme min-h-svh bg-night-gradient text-foreground"><div className="mx-auto max-w-lg space-y-8 px-5 pb-28 pt-7"><TelegramNotifications/><header><p className="text-sm text-gold">Одна карта в день</p><h1 className="mt-2 text-4xl font-semibold">Мой прогресс</h1></header>
 <div className="grid grid-cols-3 gap-3 border-y border-border py-6">{[[answers.length,'Дней пройдено'],[new Set(answers.map(day=>day.cardId)).size,'Карт'],[replies,'Реплик в диалогах']].map(([value,label])=><div key={label}><p className="text-3xl font-display text-gold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div>
 <section className="space-y-4"><h2 className="text-2xl">Мои семь дней</h2><div className="grid grid-cols-7 gap-2">{Array.from({length:7},(_,i)=>i+1).map(day=><div key={day} className="text-center"><div title={`День ${day}: ${data.days[day]?'завершён':day===status.day?'следующий':'впереди'}`} className={`mx-auto grid aspect-square w-full max-w-12 place-items-center rounded-full border ${data.days[day]?'border-gold bg-gold/15 text-gold':'border-border text-muted-foreground'}`}>{data.days[day]?<Check className="w-5"/>:day===status.day?<Clock className="w-5"/>:day}</div><p className="mt-2 text-xs">{day}</p></div>)}</div></section>
 <section className="space-y-5"><h2 className="text-2xl">Мои карты</h2>{!answers.length&&<p className="text-muted-foreground">Первый завершённый день появится здесь.</p>}{answers.map(day=><details key={day.day} className="border-b border-border pb-5"><summary className="cursor-pointer font-display text-xl">День {day.day} · {day.stage}</summary><div className="mt-4 space-y-3 text-sm"><p>Уровень: {day.level==='soft'?'Мягко':day.level==='medium'?'Средне':'Жестко'}</p><p>Чувства: {day.feelings.join(', ') || 'Нет записи'}</p>{day.aiSummary&&<p className="whitespace-pre-wrap break-words">{day.aiSummary}</p>}</div></details>)}</section></div></main>;
}
