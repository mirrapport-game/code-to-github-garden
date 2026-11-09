import { useState } from 'react';
import { Btn } from '@/components/game-ui';
import { addDialogueTurn, nextDialogueRole, type DialogueTurn } from '@/lib/intro-dialogue';

export function IntroDialogue({ turns, onChange }: { turns: DialogueTurn[]; onChange: (turns: DialogueTurn[]) => void }) {
  const [draft, setDraft] = useState('');
  const role = nextDialogueRole(turns);
  const send = () => {
    onChange(addDialogueTurn(turns, draft));
    setDraft('');
  };
  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-semibold">Диалог в этой ситуации</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">Сейчас обе роли отыгрываешь ты. Ответь на ситуацию своими словами, затем представь ответ другой стороны. Можно закончить разговор в любой момент.</p>
      <ol aria-label="Твой диалог" className="space-y-4" aria-live="polite">
        {turns.map((turn, index) => (
          <li key={index} className={`border-l-2 py-2 pl-4 ${turn.role === 'participant' ? 'border-gold' : 'border-border'}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{turn.role === 'participant' ? 'Твоя реплика' : 'Предполагаемый ответ другой стороны'}</p>
            <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{turn.text}</p>
          </li>
        ))}
      </ol>
      <label htmlFor="dialogue-reply" className="block font-semibold">{role === 'participant' ? 'Что ты скажешь в этой ситуации?' : 'Как, по твоему предположению, ответит другая сторона?'}</label>
      <textarea id="dialogue-reply" value={draft} onChange={e => setDraft(e.target.value)} placeholder={role === 'participant' ? 'Моя реплика…' : 'Предполагаемый ответ…'} className="min-h-28 w-full rounded-xl border border-input bg-card p-4 outline-none focus:border-gold" />
      <Btn onClick={send} disabled={!draft.trim()}>Добавить реплику</Btn>
      {turns.length > 0 && <Btn variant="ghost" onClick={() => { onChange(turns.slice(0, -1)); setDraft(''); }}>Убрать последнюю реплику</Btn>}
    </section>
  );
}