import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import video from "@/assets/videos/rapport-zhivaya-no-link-v2.mp4.asset.json";
import { Btn } from "@/components/game-ui";
import { Button } from "@/components/ui/button";

export function IntroVideo({ onContinue }: { onContinue: () => void }) {
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const player = useRef<HTMLVideoElement>(null);
  const toggleSound = () => {
    const element = player.current;
    if (!element) return;
    element.muted = !element.muted;
    if (!element.muted) {
      element.currentTime = 0;
      void element.play().catch(() => {});
    }
    setMuted(element.muted);
  };

  return (
    <main className="min-h-svh bg-night-gradient text-night-foreground">
      <div className="mx-auto flex min-h-svh max-w-md flex-col items-center gap-4 px-5 py-5">
        <h1 className="text-center font-display text-3xl font-semibold text-gold">Раппорт: ЖиваЯ</h1>
        {failed ? (
          <p role="alert" className="flex flex-1 items-center text-center">Не удалось загрузить ролик. Можно сразу перейти к игре.</p>
        ) : (
          <div className="relative flex w-full justify-center">
          <video
            ref={player}
            aria-label="Знакомство с приложением Раппорт: ЖиваЯ"
            src={video.url}
            autoPlay
            muted={muted}
            playsInline
            controls
            preload="auto"
            onError={() => setFailed(true)}
            onVolumeChange={event => setMuted(event.currentTarget.muted)}
            className="aspect-[9/16] max-h-[calc(100svh-170px)] w-full bg-night object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? "Включить звук" : "Выключить звук"}
            title={muted ? "Включить звук" : "Выключить звук"}
            onClick={toggleSound}
            className="absolute right-3 top-3 border border-gold/60 bg-night/80 text-gold hover:bg-night hover:text-gold-soft"
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </Button>
          </div>
        )}
        <Btn onClick={onContinue}>Перейти к игре</Btn>
      </div>
    </main>
  );
}