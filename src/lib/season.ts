export const SEASON_LENGTH = 14;

export type SeasonDay = {
  day: number;
  /** Stage of the card that opens this day, or null while the card is not in the game yet. */
  stage: string | null;
  /** What the participant does today. */
  task: string;
  ready: boolean;
};

const WAITING_TASK = "Задание появится, когда в игру придёт следующая карта.";

export const SEASON_DAYS: SeasonDay[] = [
  {
    day: 1,
    stage: "Девочка внутри",
    task: "Вытяни карту, выбери силу ситуации и ответь на вопросы рефлексии.",
    ready: true,
  },
  ...Array.from({ length: SEASON_LENGTH - 1 }, (_, i) => ({
    day: i + 2,
    stage: null,
    task: WAITING_TASK,
    ready: false,
  })),
];

export const seasonDayByStage = (stage: string): SeasonDay | undefined =>
  SEASON_DAYS.find((d) => d.stage === stage);

/** The first day that has a card and is not passed yet. */
export const nextOpenDay = (doneDays: number[]): SeasonDay | undefined =>
  SEASON_DAYS.find((d) => d.ready && !doneDays.includes(d.day));
