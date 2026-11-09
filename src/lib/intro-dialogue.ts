export type DialogueTurn = { role: 'participant' | 'other'; text: string };

export function nextDialogueRole(turns: DialogueTurn[]): DialogueTurn['role'] {
  return turns.at(-1)?.role === 'participant' ? 'other' : 'participant';
}

export function addDialogueTurn(turns: DialogueTurn[], text: string): DialogueTurn[] {
  const trimmed = text.trim();
  return trimmed ? [...turns, { role: nextDialogueRole(turns), text: trimmed }] : turns;
}