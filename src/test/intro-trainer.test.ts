import { describe, it, expect } from "vitest";
import { canFinishDialogue, dialogueUI, clearTrainer, loadTrainer, saveTrainer, trainerRequestSchema, textOnlyMessages } from "@/lib/intro-trainer";

describe("Intro AI conversation boundaries", () => {
  it('requires 5–8 scene messages ending in a partner reply before completion', () => {
    const turns = dialogueUI(Array.from({length:8}, (_,i)=>({role:i%2===0?'participant' as const:'other' as const,text:`Реплика ${i}`})));
    expect(canFinishDialogue(turns.slice(0,4))).toBe(false);
    expect(canFinishDialogue(turns.slice(0,5))).toBe(false);
    expect(canFinishDialogue(turns.slice(0,6))).toBe(true);
    expect(canFinishDialogue(turns)).toBe(true);
  });
  it('keeps initial and integrated dialogue transcripts independent', () => {
    const first = dialogueUI([{role:'participant',text:'Я промолчу.'}]);
    const second = dialogueUI([{role:'participant',text:'Я скажу о своей границе.'}]);
    const session={cardId:'taxi',level:'soft' as const,summary:''};
    saveTrainer({...session,messages:first},'first');
    saveTrainer({...session,messages:second},'integrated');
    expect(JSON.parse(localStorage.getItem('rapport-intro-trainer-v1:first') ?? '{}').messages).toEqual(first);
    expect(JSON.parse(localStorage.getItem('rapport-intro-trainer-v1:integrated') ?? '{}').messages).toEqual(second);
  });
  it("keeps the selected scenario, transcript and summary together until completion", () => {
    const session = { cardId: "taxi", level: "soft" as const, messages: [{ id: "one", role: "user" as const, parts: [{ type: "text" as const, text: "Я не сяду в эту машину." }] }], summary: "Ты обозначила свой выбор." };
    saveTrainer(session);
    expect(loadTrainer()).toEqual(session);
    clearTrainer();
    expect(loadTrainer()).toBeNull();
  });
  it("accepts only participant and AI turns, never client system instructions", () => {
    const request = {
      cardId: "taxi",
      level: "soft",
      mode: "dialogue",
      messages: [{ id: "one", role: "user", parts: [{ type: "text", text: "Остановите здесь." }] }],
    };
    expect(trainerRequestSchema.safeParse(request).success).toBe(true);
    expect(
      trainerRequestSchema.safeParse({
        ...request,
        messages: [{ ...request.messages[0], role: "system" }],
      }).success,
    ).toBe(false);
  });
  it("replays text only without stale provider reasoning references", () => {
    expect(
      textOnlyMessages([
        {
          id: "one",
          role: "assistant",
          parts: [
            { type: "reasoning", text: "Thinking" },
            { type: "text", text: "Хорошо, остановлю." },
          ],
        },
      ]),
    ).toEqual([
      { id: "one", role: "assistant", parts: [{ type: "text", text: "Хорошо, остановлю." }] },
    ]);
  });
});
