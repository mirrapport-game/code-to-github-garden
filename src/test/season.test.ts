import { describe, expect, it, beforeEach } from "vitest";

import { CARDS } from "@/lib/cards";
import { SEASON_DAYS, SEASON_LENGTH, nextOpenDay, seasonDayByStage } from "@/lib/season";
import { clearSeason, loadSeason, saveSeasonDay, type DayAnswer } from "@/lib/season-store";

const day1: DayAnswer = {
  day: 1,
  stage: "Девочка внутри",
  level: "medium",
  feelings: ["обида"],
  body: ["грудь"],
  hurt: "Что я не имею права уставать",
  shadow: "Я не разрешаю себе быть лёгкой",
  resource: "Ты живая, и твои чувства настоящие",
  doneAt: "2026-11-07T15:00:00.000Z",
};

describe("Season 1 structure", () => {
  it("runs 14 days numbered 1..14", () => {
    expect(SEASON_LENGTH).toBe(14);
    expect(SEASON_DAYS).toHaveLength(14);
    expect(SEASON_DAYS.map((d) => d.day)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
  });

  it("opens only day 1 while just one card exists", () => {
    expect(SEASON_DAYS.filter((d) => d.ready).map((d) => d.day)).toEqual([1]);
    expect(SEASON_DAYS.filter((d) => !d.ready).every((d) => d.stage === null)).toBe(true);
  });

  it("links day 1 to the real card with the three situations", () => {
    expect(seasonDayByStage("Девочка внутри")?.day).toBe(1);
    const card = CARDS.find((c) => c.stage === "Девочка внутри");
    expect(card?.levels.soft.title).toBe("Мягкое обесценивание");
    expect(card?.levels.medium.title).toBe("Средняя критика");
    expect(card?.levels.hard.title).toBe("Жёсткая критика");
  });

  it("shows day 1 as today, and nothing as today once day 1 is passed", () => {
    expect(nextOpenDay([])?.day).toBe(1);
    expect(nextOpenDay([1])).toBeUndefined();
  });
});

describe("Season answers", () => {
  beforeEach(() => {
    clearSeason();
  });

  it("starts with nothing passed", () => {
    expect(Object.keys(loadSeason().days)).toEqual([]);
  });

  it("keeps her own answers for the day she passed", () => {
    saveSeasonDay(day1);
    const state = loadSeason();
    expect(state.days[1]?.level).toBe("medium");
    expect(state.days[1]?.hurt).toBe("Что я не имею права уставать");
    expect(state.days[1]?.shadow).toBe("Я не разрешаю себе быть лёгкой");
    expect(state.days[1]?.resource).toBe("Ты живая, и твои чувства настоящие");
    expect(nextOpenDay(Object.keys(state.days).map(Number))).toBeUndefined();
  });
});
