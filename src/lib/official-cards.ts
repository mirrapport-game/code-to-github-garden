import scenarios from '@/lib/official-scenarios.json';
import innerGirl from '@/assets/inner-girl.webp.asset.json';
import friends from '@/assets/friends.webp.asset.json';
import femininity from '@/assets/femininity.webp.asset.json';
import family from '@/assets/family.webp.asset.json';
import business from '@/assets/business.webp.asset.json';
import career from '@/assets/career.webp.asset.json';
import relationships from '@/assets/relationships.webp.asset.json';
import group from '@/assets/group.webp.asset.json';
import dependencies from '@/assets/dependencies.webp.asset.json';
import type { GameCard } from '@/lib/cards';

const covers: Record<string, string> = {
  'Девочка внутри':innerGirl.url, 'Подруги и окружение':friends.url,
  'Женственность':femininity.url, 'Дела семейные':family.url,
  'Я и моё дело / бизнес':business.url, 'Я и работа / карьера':career.url,
  'От знакомств до отношений':relationships.url, 'Группа против':group.url, 'Зависимости':dependencies.url,
};
export const OFFICIAL_CARDS: GameCard[] = scenarios.map(card => ({...card,cover:covers[card.stage] ?? '',source:'official'}));
export const PLAYABLE_CARDS = OFFICIAL_CARDS.filter(card => card.cover && Object.values(card.levels).every(level => level.text.trim()));
/** Curated links between original situations and the nine reflection concepts. */
export const THEME_CARD_IDS: Record<string,string[]> = {
  'Границы':['family-3','friends-7','business-3','career-5'],
  'Просьба о помощи':['family-6','business-11','business-1','group-6'],
  'Влияние':['business-2','career-1','career-7','family-10'],
  'Дистанция':['inner-girl-7','friends-8','dependencies-16','relationships-9'],
  'Слабость':['inner-girl-2','inner-girl-3','femininity-8','business-8'],
  'Наглость':['career-2','business-13','femininity-9','friends-5'],
  'Жертва':['family-7','family-9','business-11','dependencies-4'],
  'Манипуляция':['friends-5','dependencies-19','group-12','dependencies-10'],
  'Холодность':['inner-girl-4','femininity-7','femininity-10','dependencies-7'],
};
export function cardsForTheme(theme: string) {
  return PLAYABLE_CARDS.filter(card => card.id && THEME_CARD_IDS[theme]?.includes(card.id));
}
