import shades from '@/lib/shadow-shades.json';
import { PLAYABLE_CARDS, THEME_CARD_IDS } from '@/lib/official-cards';

export const SHADOW_SHADES = shades;
export type ShadowShade = (typeof shades)[number];
const stageShades: Record<string, string[]> = {
  'Девочка внутри':['Стыд','Слабость','Принятие','Творчество','Игра'],
  'Подруги и окружение':['Близость','Отвержение','Зависть','Границы','Манипуляция'],
  'Женственность':['Сексуальность','Соблазнение','Принятие','Спонтанность','Гедонизм'],
  'Дела семейные':['Ответственность','Контроль','Покорность','Просьба о помощи','Вина'],
  'Я и моё дело / бизнес':['Влияние','Величие','Ответственность','Страх','Свобода'],
  'Я и работа / карьера':['Влияние','Наглость','Границы','Ничтожество','Ответственность'],
  'От знакомств до отношений':['Близость','Дистанция','Зависимость','Соблазнение','Холодность'],
  'Группа против':['Бунт','Отвержение','Осуждение','Покорность','Влияние'],
  'Зависимости':['Зависимость','Контроль','Жадность','Гедонизм','Одиночество'],
  'Материнство':['Вина','Контроль','Ответственность','Просьба о помощи','Слабость'],
  'В социуме':['Границы','Отказ','Агрессия','Гнев','Наглость'],
};
/** Editorial candidates, not a psychological classification of the participant. */
export function shadesForCard(cardId: string | undefined, theme: string): ShadowShade[] {
  const card = PLAYABLE_CARDS.find(c => c.id === cardId);
  const names = new Set(stageShades[card?.stage ?? ''] ?? []);
  names.add(theme);
  for (const [concept, ids] of Object.entries(THEME_CARD_IDS)) {
    if (cardId && ids.includes(cardId)) names.add(concept);
  }
  return SHADOW_SHADES.filter(shade => names.has(shade.name));
}
export function drawShade(cardId: string | undefined, theme: string, used: string[], random = Math.random) {
  const pool = shadesForCard(cardId, theme).filter(shade => !used.includes(shade.id));
  return pool[Math.max(0, Math.min(pool.length - 1, Math.floor(random() * pool.length)))];
}