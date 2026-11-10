import { useId, useState } from 'react';
import { Btn } from '@/components/game-ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ComingSoonButton({children, hint}: {children: React.ReactNode; hint: string}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <TooltipProvider delayDuration={150}><Tooltip open={open} onOpenChange={setOpen}>
    <TooltipTrigger asChild><span tabIndex={0} aria-describedby={id} className="block w-full cursor-not-allowed" onClick={()=>setOpen(true)} onBlur={()=>setOpen(false)}>
      <Btn disabled variant="ghost" className="border-muted text-muted-foreground">{children}</Btn>
    </span></TooltipTrigger>
    <TooltipContent id={id}>{hint}</TooltipContent>
  </Tooltip><p className="mt-2 text-center text-xs text-muted-foreground">{hint}</p></TooltipProvider>;
}