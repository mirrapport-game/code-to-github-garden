import { describe, it, expect } from "vitest";
import { clearTrainer, loadTrainer, saveTrainer, trainerRequestSchema, textOnlyMessages } from "@/lib/intro-trainer";

describe("Intro AI conversation boundaries", () => {
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
