import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id";

export const TIMEWEB_MODEL = "deepseek/deepseek-flash";
export const TIMEWEB_GUARD_ID = "intro-timeweb-deepseek-flash";

export function createTimewebChatCall(
  request: Request,
  credentials: { gatewayKey: string; connectionKey: string },
  messages: ModelMessage[],
  instructions: string,
  inspectResponse: (response: Response) => Promise<void>,
) {
  const gateway = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://connector-gateway.lovable.dev/udc_timeweb_ai_gateway",
    apiKey: credentials.gatewayKey,
    headers: { "X-Connection-Api-Key": credentials.connectionKey },
    fetch: async (input, init) => {
      const response = await gateway.fetch(input, init);
      await inspectResponse(response);
      return response;
    },
  });
  const result = streamText({
    model: provider.chat(TIMEWEB_MODEL),
    system: instructions,
    messages,
    abortSignal: request.signal,
    maxRetries: 0,
  });
  return { result, gateway };
}