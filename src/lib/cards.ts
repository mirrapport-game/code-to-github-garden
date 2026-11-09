import devochkaCover from "@/assets/devochka_vnutri_cover.png.asset.json";

export type LevelKey = "soft" | "medium" | "hard";

export type Situation = { title: string; text: string };

export type GameCard = {
  stage: string;
  cover: string;
  scenario: string;
  context: string;
  levels: Record<LevelKey, Situation>;
};

export const LEVEL_META: Record<LevelKey, { label: string; icon: string; bg: string; text: string }> = {
  soft: { label: "Мягкая", icon: "🍃", bg: "bg-level-soft", text: "text-level-soft" },
  medium: { label: "Средняя", icon: "⚡", bg: "bg-level-medium", text: "text-level-medium" },
  hard: { label: "Жёсткая", icon: "🔥", bg: "bg-level-hard", text: "text-level-hard" },
};

export const CARDS: GameCard[] = [
  {
    stage: "Девочка внутри",
    cover: devochkaCover.url,
    scenario: "«Я не помню, когда играла»",
    context:
      "В разговоре с подругой ты вдруг понимаешь, что не помнишь, когда в последний раз делала что-то просто для радости. Ты говоришь ей об этом, надеясь на понимание.",
    levels: {
      soft: {
        title: "Мягкое обесценивание",
        text: "Подруга с усмешкой говорит, что ты драматизируешь, у тебя всё хорошо — семья, работа, муж, квартира, и что тебе просто нужно отдохнуть. Ты пытаешься объяснить, что дело не в усталости, а она отмахивается: «Ты слишком много думаешь, живи проще».",
      },
      medium: {
        title: "Средняя критика",
        text: "Она скрещивает руки на груди и говорит, что ты сама выбрала эту жизнь, и если тебе что-то не нравится — меняй, не ной. Она перебивает твои попытки объяснить: «Хватит себя жалеть, просто сделай что-нибудь, я тоже устаю, но я не жалуюсь».",
      },
      hard: {
        title: "Жёсткая критика",
        text: "Она холодно отвечает, что ты уже не девочка, чтобы ныть о том, что хочется играть, тебе пора взрослеть. Она добавляет, что если ты не можешь справиться с собой, то иди к психологу, но не грузи её своими проблемами. Ты чувствуешь, что твоя боль — это слабость, а ты — никому не нужна.",
      },
    },
  },
];

export const FEELINGS = ["обида", "злость", "стыд", "грусть", "страх", "одиночество", "растерянность", "беспомощность", "вина", "тревога", "пустота", "облегчение"];
export const BODY = ["горло", "грудь", "живот", "плечи", "руки", "лицо", "спина", "ноги", "не чувствую"];

export const drawCard = (exclude?: GameCard) => {
  const pool = CARDS.length > 1 ? CARDS.filter((c) => c !== exclude) : CARDS;
  return pool[Math.floor(Math.random() * pool.length)];
};
