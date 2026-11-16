import { z } from "zod";
import type { UIMessage } from "ai";
import type { DialogueTurn } from '@/lib/intro-dialogue';
import { setupSchema, DAY_FEELINGS } from '@/lib/intro-day';

export function dialogueUI(turns: DialogueTurn[] = []): UIMessage[] {
  return turns.map((turn, index) => ({ id: `turn-${index}`, role: turn.role === 'participant' ? 'user' : 'assistant', parts: [{ type: 'text', text: turn.text }] }));
}

export function canFinishDialogue(messages: UIMessage[], minimum = 5): boolean {
  const turns = textOnlyMessages(messages);
  return turns.length >= minimum && turns.at(-1)?.role === 'assistant';
}

export const trainerRequestSchema = z
  .object({
    cardId: z.string().min(1).max(100),
    level: z.enum(["soft", "medium", "hard"]),
    mode: z.enum(["dialogue", "reflection", "summary"]),
    quality: z.string().max(60).optional(),
    shadeId: z.string().max(100).optional(),
    introHelp: z.enum(['skill', 'partner']).optional(),
    introDay: z.object({ setupAnswers: setupSchema, feelings: z.array(z.string().refine(value => DAY_FEELINGS.includes(value))).min(1).max(3), firstMessage: z.string().max(4000), qualities: z.array(z.string().max(60)).max(20).optional(), shadows: z.array(z.string().max(60)).max(20).optional(), emotionIntensity: z.number().int().min(1).max(10).nullable().optional(), skill: z.string().max(12000).optional(), requestReflection: z.object({requestText:z.string().max(12000),connection:z.string().max(12000),action:z.string().max(12000)}).optional() }).strict().optional(),
    messages: z
      .array(
        z.object({
          id: z.string().min(1).max(150),
          role: z.enum(["user", "assistant"]),
          parts: z
            .array(z.object({ type: z.literal("text"), text: z.string().min(1).max(12000) }))
            .min(1)
            .max(8),
        }),
      )
      .min(1)
      .max(100),
  })
  .strict()
  .refine(value => !value.introHelp || (Boolean(value.introDay) && value.mode === 'dialogue'), {message: 'Помощь доступна только в диалоге вводного дня.'});

export function textOnlyMessages(messages: UIMessage[]): UIMessage[] {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts
        .filter((p) => p.type === "text" && p.text.trim().length > 0)
        .map((p) => ({ type: "text" as const, text: p.type === "text" ? p.text : "" })),
    }))
    .filter((m) => m.parts.length > 0);
}

export type TrainerSession = {
  cardId: string;
  level: "soft" | "medium" | "hard";
  messages: UIMessage[];
  summary: string;
};
const KEY = "rapport-intro-trainer-v1";
export function loadTrainer(): TrainerSession | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as TrainerSession;
    // Summary is deliberately not part of the request payload.
    const validated = trainerRequestSchema.safeParse({
      cardId: value.cardId,
      level: value.level,
      mode: "dialogue",
      messages: textOnlyMessages(value.messages),
    });
    if (!validated.success && value.messages.length > 0) return null;
    if (typeof value.cardId !== "string" || !["soft", "medium", "hard"].includes(value.level))
      return null;
    return { ...value, summary: typeof value.summary === "string" ? value.summary : "" };
  } catch {
    return null;
  }
}
export function saveTrainer(session: TrainerSession, scope?: string) {
  window.localStorage.setItem(
    scope ? `${KEY}:${scope}` : KEY,
    JSON.stringify({ ...session, messages: textOnlyMessages(session.messages) }),
  );
}
export function clearTrainer() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Storage unavailable. */
  }
}
