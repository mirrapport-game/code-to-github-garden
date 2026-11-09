import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, Layers } from 'lucide-react';
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

  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Btn variant="ghost" onClick={() => setOpen(true)}><span className="flex items-center justify-center gap-3"><Layers className="h-5 w-5 shrink-0" />Оттенки тени</span></Btn>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-night/70" />
      <Dialog.Content aria-describedby={undefined} className="challenge-theme fixed inset-0 z-50 overflow-y-auto bg-night-gradient text-foreground outline-none">
        <div className="mx-auto max-w-lg px-5 pb-12">
          <header className="sticky top-0 z-10 bg-background py-4">
            <Btn variant="ghost" onClick={() => setOpen(false)}><span className="flex items-center justify-center gap-3"><ArrowLeft className="h-5 w-5 shrink-0" />Вернуться назад</span></Btn>
          </header>
          <Dialog.Title className="sr-only">Оттенки тени</Dialog.Title>
          <div className="pt-5"><ShadowReflection expanded shadeId={shadeId} answers={answers} onAnswers={onAnswers} /></div>
          <Btn className="mt-6" variant="ghost" onClick={() => setOpen(false)}>Вернуться назад</Btn>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}