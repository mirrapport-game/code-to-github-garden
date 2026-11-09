import { describe, it, expect } from "vitest";
import { trainerRequestSchema, textOnlyMessages } from "@/lib/intro-trainer";

describe("Intro AI conversation boundaries", () => {
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
