import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { DEMO_CARDS } from '@/lib/demo-cards';
import { ChallengeDay } from '@/components/challenge-day';

export function ChallengePreview({ day, onClose }: { day: number; onClose: () => void }) {
  const [stage, setStage] = useState('Слабость');
  const card = DEMO_CARDS.find(item => item.stage === stage);
  return <div className="space-y-6">
    <p className="text-sm uppercase text-gold">Просмотр · День {day} / 7</p>
    <label className="block space-y-2 font-semibold">Сфера<select aria-label="Сфера карты" value={stage} onChange={e => setStage(e.target.value)} className="w-full rounded-lg border border-input bg-card p-3 font-normal">{DEMO_CARDS.map(item => <option key={item.stage}>{item.stage}</option>)}</select></label>
    {card && <ChallengeDay key={stage} day={day} card={card} onDraft={() => {}} onComplete={onClose} />}
    <Btn variant="ghost" onClick={onClose}>К семи дням</Btn>
  </div>;
}
