import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/intro-trainer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleIntroTrainer } = await import("@/lib/ai/intro-trainer.server");
        return handleIntroTrainer(request);
      },
    },
  },
});
