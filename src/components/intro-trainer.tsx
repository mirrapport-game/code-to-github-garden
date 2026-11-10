import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Btn, Logo } from "@/components/game-ui";
import { canFinishDialogue, saveTrainer, textOnlyMessages } from "@/lib/intro-trainer";
import type { LevelKey } from "@/lib/cards";
import type { DialogueTurn } from "@/lib/intro-dialogue";

export function IntroTrainer({
  cardId,
  level,
  initialMessages,
  initialSummary,
  quality,
  shadeId,
  minMessages = 0,
  maxParticipantMessages,
  placeholder = "Я хочу сказать…",
  sessionId,
  withFeedback = true,
  onProgress,
  onComplete,
}: {
  sessionId?: string;
  withFeedback?: boolean;
  onProgress?: (dialogue: DialogueTurn[]) => void;
  quality?: string;
  shadeId?: string;
  minMessages?: number;
  maxParticipantMessages?: number;
  placeholder?: string;
  cardId: string;
  level: LevelKey;
  initialMessages: UIMessage[];
  initialSummary: string;
  onComplete: (dialogue: DialogueTurn[], summary: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [summaryMode, setSummaryMode] = useState(Boolean(initialSummary));
  const [summary, setSummary] = useState(initialSummary);
  const [failure, setFailure] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const mode = useRef<"dialogue" | "summary">("dialogue");
  const summaryId = useRef<string | null>(null);
  const summaryStart = useRef<number | null>(null);
  const progressCallback = useRef(onProgress);
  progressCallback.current = onProgress;
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/intro-trainer",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { cardId, level, mode: mode.current, ...(quality ? { quality } : {}), ...(shadeId ? { shadeId } : {}), messages: textOnlyMessages(messages) },
        }),
        fetch: async (url, init) => {
          const response = await fetch(url, init);
          if (!response.ok) {
            let message = "Разговор прервался. Можно продолжить позже.";
            try {
              const body = await response.json();
              if (typeof body.message === "string") message = body.message;
            } catch {
              /* network response */
            }
            throw new Error(message);
          }
          return response;
        },
      }),
    [cardId, level, quality, shadeId],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: sessionId ?? `intro-${cardId}-${level}-${quality ?? shadeId ?? ""}`,
    messages: initialMessages,
    transport,
    onError: (error) => setFailure(error.message),
    onFinish: ({ message }) => {
      if (mode.current === "summary") {
        summaryId.current = message.id;
        setSummary(
          message.parts
            .filter((p) => p.type === "text")
            .map((p) => p.text)
            .join(""),
        );
      }
      input.current?.focus();
    },
  });
  const busy = status === "submitted" || status === "streaming";
  const dialogueMessages = useMemo(
    () =>
      messages.filter(
        (m, index) =>
          (summaryStart.current === null || index < summaryStart.current) &&
          m.id !== summaryId.current &&
          !m.parts.some(
            (p) => p.type === "text" && p.text === "Завершаю сцену. Подведи итог нашего разговора.",
          ),
      ),
    [messages],
  );
  const userTurns = dialogueMessages.filter((m) => m.role === "user").length;
  const limitReached = maxParticipantMessages !== undefined && userTurns >= maxParticipantMessages;
  const liveSummary =
    summaryMode && summaryStart.current !== null
      ? messages
          .slice(summaryStart.current)
          .filter((m) => m.role === "assistant")
          .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => p.text))
          .join("")
      : summary;
  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );
  useEffect(() => {
    try {
      saveTrainer({ cardId, level, messages: textOnlyMessages(dialogueMessages), summary }, sessionId);
    } catch {
      setFailure(
        "Не удалось сохранить разговор в этом браузере. Не закрывай страницу до завершения.",
      );
    }
  }, [cardId, level, dialogueMessages, summary, sessionId]);
  useEffect(() => {
    if (!busy) progressCallback.current?.(textOnlyMessages(dialogueMessages).map(m => ({ role: m.role === 'user' ? 'participant' : 'other', text: m.parts.filter(p => p.type === 'text').map(p => p.text).join('\n') })));
  }, [dialogueMessages, busy]);
  useEffect(() => {
    if (!busy && !summaryMode) input.current?.focus();
  }, [busy, summaryMode]);
  const finish = () => {
    onComplete(
      textOnlyMessages(dialogueMessages).map((m) => ({
        role: m.role === "user" ? "participant" : "other",
        text: m.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("\n"),
      })),
      summary,
    );
  };
  const conclude = () => {
    setFailure("");
    mode.current = "summary";
    summaryStart.current = messages.length;
    setSummaryMode(true);
    void sendMessage({ text: "Завершаю сцену. Подведи итог нашего разговора." });
  };
  return (
    <section className="space-y-5">
      <header className="flex items-center gap-3">
        <Logo className="h-10 w-10 shrink-0 text-xl" />
        <div>
          <h2 className="text-3xl font-semibold">
            {summaryMode ? "После разговора" : "Внутри ситуации"}
          </h2>
          <p className="text-xs text-muted-foreground">ИИ-собеседник · Раппорт: ЖиваЯ</p>
        </div>
      </header>
      {!summaryMode && (
        <>
          <Conversation className={dialogueMessages.length ? "h-80 border-y border-border" : "h-20 border-y border-border"} aria-label="Разговор с ИИ">
            <ConversationContent className="px-0 py-5">
              {!dialogueMessages.length && (
                <p className="font-display text-xl italic text-muted-foreground">
                  Что ты скажешь человеку в этой ситуации?
                </p>
              )}
              {dialogueMessages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent
                    className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {m.parts.map((p, i) =>
                      p.type === "text" ? (
                        <MessageResponse key={i}>{p.text}</MessageResponse>
                      ) : p.type === "reasoning" ? (
                        <details key={i} className="text-xs text-muted-foreground">
                          <summary>Подготовка ответа</summary>
                          {p.text}
                        </details>
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))}
              {busy && <Shimmer>Собеседник отвечает…</Shimmer>}
            </ConversationContent>
            <ConversationScrollButton aria-label="К последнему сообщению" />
          </Conversation>
          {maxParticipantMessages !== undefined && (
            <p className="text-xs text-muted-foreground">
              Сообщений: {dialogueMessages.length} · итог откроется после {minMessages}, максимум {maxParticipantMessages * 2}
            </p>
          )}
          <PromptInput
            onSubmit={() => {
              const text = draft.trim();
              if (!text || busy || limitReached) return;
              setFailure("");
              mode.current = "dialogue";
              setDraft("");
              void sendMessage({ text });
              input.current?.focus();
            }}
          >
            <PromptInputTextarea
              ref={input}
              autoFocus
              aria-label="Твой ответ собеседнику"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={4000}
              disabled={limitReached}
              placeholder={limitReached ? "Сцена сыграна — посмотри итог" : dialogueMessages.length ? "Я отвечаю…" : placeholder}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                aria-label={busy ? "Остановить ответ" : "Отправить ответ"}
                title={busy ? "Остановить ответ" : "Отправить ответ"}
                status={status}
                onStop={() => void stop()}
                disabled={!busy && !draft.trim()}
              />
            </PromptInputFooter>
          </PromptInput>
          <Btn
            disabled={
              busy ||
              !canFinishDialogue(dialogueMessages, minMessages) || Boolean(failure)
            }
            onClick={withFeedback ? conclude : finish}
          >
            {withFeedback ? 'Завершить разговор · увидеть итог' : 'Завершить разговор · к рефлексии'}
          </Btn>
        </>
      )}
      {summaryMode && (
        <>
          {liveSummary && (
            <div className="border-l-2 border-gold pl-4 leading-relaxed">
              <MessageResponse>{liveSummary}</MessageResponse>
            </div>
          )}
          {busy && <Shimmer>Собираем то, что стало заметно…</Shimmer>}
          {!busy && !summary && (
            <Btn
              variant="ghost"
              onClick={() => {
                setSummaryMode(false);
                mode.current = "dialogue";
              }}
            >
              Вернуться к разговору
            </Btn>
          )}
          {summary && (
            <Btn disabled={busy} onClick={finish}>
              Дальше
            </Btn>
          )}
        </>
      )}
      {failure && (
        <p role="alert" className="break-words text-sm text-destructive">
          {failure}
        </p>
      )}
      {!busy && !summary && minMessages === 0 && (
        <Btn variant="ghost" onClick={finish}>
          Продолжить без итога
        </Btn>
      )}
      <p className="text-xs text-muted-foreground">
        Это игровая сцена с ИИ, не психотерапия. Можно остановиться в любой момент.
      </p>
    </section>
  );
}
