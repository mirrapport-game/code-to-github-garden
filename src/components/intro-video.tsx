import { useState } from "react";
import video from "@/assets/videos/rapport-zhivaya-30s.mp4.asset.json";
import { Btn } from "@/components/game-ui";

export function IntroVideo({ onContinue }: { onContinue: () => void }) {
  const [failed, setFailed] = useState(false);

  return (
    <main className="min-h-svh bg-night-gradient text-night-foreground">
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center gap-4 px-5 py-5">
        <h1 className="text-center font-display text-3xl font-semibold text-gold">Раппорт: ЖиваЯ</h1>
        {failed ? (
          <p role="alert" className="flex flex-1 items-center text-center">Не удалось загрузить ролик. Можно сразу перейти к игре.</p>
        ) : (
          <video
            aria-label="Знакомство с приложением Раппорт: ЖиваЯ"
            src={video.url}
            autoPlay
            muted
            playsInline
            controls
            preload="auto"
            onError={() => setFailed(true)}
            className="aspect-[9/16] max-h-[calc(100svh-170px)] w-full bg-night object-contain"
          />
        )}
        <Btn onClick={onContinue}>Перейти к игре</Btn>
      </div>
    </main>
  );
}