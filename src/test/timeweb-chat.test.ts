import { afterEach, describe, expect, it, vi } from "vitest";
import { createTimewebChatCall, TIMEWEB_GUARD_ID } from "@/lib/ai/timeweb-chat.server";

const mocks = vi.hoisted(() => ({
  createOpenAI: vi.fn(),
  streamText: vi.fn(() => ({ stream: true })),
  chat: vi.fn(() => "chat-model"),
}));
vi.mock("@ai-sdk/openai", () => ({ createOpenAI: mocks.createOpenAI }));
vi.mock("ai", () => ({ streamText: mocks.streamText }));

afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("Timeweb trainer transport", () => {
  it("sends the full history and system instructions through DeepSeek Chat Completions without retries", () => {
    mocks.createOpenAI.mockReturnValue({ chat: mocks.chat });
    const messages = [{ role: "user" as const, content: "Остановите здесь." }, { role: "assistant" as const, content: "Хорошо." }];
    createTimewebChatCall(new Request("https://game.test/api/intro-trainer"), { gatewayKey: "test-only", connectionKey: "test-only" }, messages, "Сцена и интегрированное качество", vi.fn());
    expect(mocks.chat).toHaveBeenCalledWith("deepseek/deepseek-flash");
    expect(mocks.streamText).toHaveBeenCalledWith(expect.objectContaining({ messages, system: "Сцена и интегрированное качество", maxRetries: 0 }));
    expect(TIMEWEB_GUARD_ID).not.toBe("intro-openai-gpt-6-astra");
  });

  it("passes provider error responses to the existing access guard without retrying", async () => {
    mocks.createOpenAI.mockReturnValue({ chat: mocks.chat });
    const denied = new Response(JSON.stringify({ error: { message: "token_limit_exceeded" } }), { status: 402 });
    const network = vi.fn().mockResolvedValue(denied);
    vi.stubGlobal("fetch", network);
    const inspectResponse = vi.fn();
    createTimewebChatCall(new Request("https://game.test/api/intro-trainer"), { gatewayKey: "test-only", connectionKey: "test-only" }, [], "Сцена", inspectResponse);
    const config = mocks.createOpenAI.mock.calls[0]?.[0] as { baseURL: string; fetch: typeof fetch };
    expect(config.baseURL).toBe("https://connector-gateway.lovable.dev/udc_timeweb_ai_gateway");
    await config.fetch(`${config.baseURL}/chat/completions`);
    expect(inspectResponse).toHaveBeenCalledWith(denied);
    expect(network).toHaveBeenCalledTimes(1);
  });
});