import { useState } from 'react';
import { ChevronUp, Layers } from 'lucide-react';
import { Btn } from '@/components/game-ui';
import { ShadowReflection } from '@/components/shadow-reflection';
import { SHADOW_SHADES } from '@/lib/shadow-shades';

export function ShadowCardButton({ shadeId, answers, onAnswers }: {
  shadeId?: string | undefined;
  answers?: string[] | undefined;
  onAnswers?: ((answers: string[]) => void) | undefined;
}) {
  const [open, setOpen] = useState(false);
  if (!SHADOW_SHADES.some(shade => shade.id === shadeId)) return null;

  return <section className="space-y-5">
    <Btn variant="ghost" onClick={() => setOpen(true)}><span className="flex items-center justify-center gap-3"><Layers className="h-5 w-5 shrink-0" />Оттенки тени</span></Btn>
    {open && <div className="space-y-5 animate-rise">
      <ShadowReflection expanded shadeId={shadeId} answers={answers} onAnswers={onAnswers} />
      <Btn variant="ghost" onClick={() => setOpen(false)}><span className="flex items-center justify-center gap-3"><ChevronUp className="h-5 w-5" />Свернуть карту</span></Btn>
    </div>}
  </section>;
}