import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { CHALLENGE_STORIES } from '@/lib/challenge-story';

export function ChallengeStory({ day, onComplete }: { day: number; onComplete: () => void }) {
  const [page, setPage] = useState(0);
  const story = CHALLENGE_STORIES[day - 1];
  const current = story?.pages[page];
  if (!story || !current) return null;
  const last = page === story.pages.length - 1;
  return <section className="space-y-7 animate-rise">
    <p className="text-sm uppercase text-gold">День {day} · {page + 1} / {story.pages.length}</p>
    <h1 className="text-4xl font-semibold">{story.title}</h1>
    <div className="flex gap-2" aria-hidden="true">{story.pages.map((_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index <= page ? 'bg-gold' : 'bg-secondary'}`} />)}</div>
    <div className="min-h-60 space-y-5 border-l-2 border-gold pl-5"><h2 className="text-3xl font-semibold">{current.title}</h2><p className="text-lg leading-relaxed">{current.text}</p></div>
    <div className="flex gap-3">{page > 0 && <Btn variant="ghost" onClick={() => setPage(page - 1)}>Назад</Btn>}<Btn onClick={() => { if (last) onComplete(); else {setPage(page + 1); window.scrollTo(0,0);} }}>{last ? 'К сегодняшней карте' : 'Дальше'}</Btn></div>
  </section>;
}