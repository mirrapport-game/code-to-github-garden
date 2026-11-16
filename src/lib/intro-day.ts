import { z } from 'zod';
import type { LevelKey } from '@/lib/cards';
import type { UIMessage } from 'ai';
import { INTRO_QUALITIES, INTRO_SELF_QUALITIES } from '@/lib/intro-choices';

export const DAY_FEELINGS = ['Обида', 'Злость', 'Стыд', 'Страх', 'Беспомощность', 'Одиночество', 'Усталость', 'Вина', 'Отчаяние', 'Пустота', 'Раздражение', 'Тревога', 'Гнев', 'Разочарование', 'Грусть', 'Печаль', 'Растерянность', 'Досада', 'Ревность', 'Зависть', 'Отвращение', 'Недоверие', 'Беспокойство', 'Уязвимость', 'Неловкость', 'Возмущение', 'Радость', 'Облегчение', 'Надежда', 'Благодарность'];
export const SETUP_QUESTIONS = ['Какие вопросы ты бы хотела задать партнёру?', 'Как думаешь, что чувствует партнёр?', 'Как ты думаешь, что на самом деле хочет тебе сказать твой партнёр?', 'Где твой персонаж может говорить так же?'];
export const setupSchema = z.tuple([z.string().trim().min(1).max(12000), z.string().trim().min(1).max(12000), z.string().trim().min(1).max(12000), z.string().trim().min(1).max(12000)]);
export type IntroDay = {
  id: string; card_id: string; partner_harshness: LevelKey | null; partner_line: string;
  chosen_feelings: string[]; feelings_chosen: boolean; release_method: 'forest' | 'mountain' | 'toilet' | null;
  setup_answers: string[]; new_dialogue_first_message: string; dialogue: UIMessage[];
  summary_text: string; step: number; completed_at: string | null;
  chosen_qualities: string[]; chosen_shadows: string[]; reflection_stage: 'feelings' | 'qualities' | 'shadow';
  emotion_intensity: number | null; skill_text: string; skill_dialogue: UIMessage[];
  request_reflection: {requestText: string; connection: string; action: string};
};
export function newIntroDay(cardId: string): IntroDay {
  return {id: crypto.randomUUID(), card_id: cardId, partner_harshness: null, partner_line: '', chosen_feelings: [], feelings_chosen: false, release_method: null, setup_answers: ['', '', '', ''], new_dialogue_first_message: '', dialogue: [], summary_text: '', step: 1, completed_at: null, chosen_qualities: [], chosen_shadows: [], reflection_stage: 'feelings', emotion_intensity: null, skill_text: '', skill_dialogue: [], request_reflection: {requestText:'',connection:'',action:''}};
}
export function toggleDayQuality(selected: string[], quality: string, shadow = false) {
  const options = shadow ? INTRO_SELF_QUALITIES : INTRO_QUALITIES;
  if (!options.includes(quality)) return selected;
  if (quality === 'Пока не знаю') return selected.includes(quality) ? [] : [quality];
  return selected.includes(quality) ? selected.filter(item => item !== quality) : [...selected.filter(item => item !== 'Пока не знаю'), quality];
}
export function toggleDayFeeling(selected: string[], feeling: string): string[] {
  if (!DAY_FEELINGS.includes(feeling)) return selected;
  return selected.includes(feeling) ? selected.filter(item => item !== feeling) : selected.length < 3 ? [...selected, feeling] : selected;
}
export function setupComplete(answers: string[]) { return setupSchema.safeParse(answers).success; }
export function dialogueComplete(messages: UIMessage[]) {
  return messages.filter(item => item.role === 'user').length >= 3 && messages.at(-1)?.role === 'assistant' && messages.at(-1)?.parts.some(part => part.type === 'text' && part.text.trim());
}
export function persistableDay(day: IntroDay): IntroDay {
  return {id: day.id, card_id: day.card_id, partner_harshness: day.partner_harshness, partner_line: day.partner_line, chosen_feelings: day.chosen_feelings, feelings_chosen: day.feelings_chosen, release_method: day.release_method, setup_answers: day.setup_answers, new_dialogue_first_message: day.new_dialogue_first_message, dialogue: day.dialogue, summary_text: day.summary_text, step: day.step, completed_at: day.completed_at, chosen_qualities: day.chosen_qualities ?? [], chosen_shadows: day.chosen_shadows ?? [], reflection_stage: day.reflection_stage ?? 'feelings', emotion_intensity: day.emotion_intensity ?? null, skill_text: day.skill_text ?? '', skill_dialogue: day.skill_dialogue ?? [], request_reflection: day.request_reflection ?? {requestText:'',connection:'',action:''}};
}
export function dayContext(day: IntroDay) {
  return { setupAnswers: day.setup_answers, feelings: day.chosen_feelings, firstMessage: day.new_dialogue_first_message, qualities: day.chosen_qualities ?? [], shadows: day.chosen_shadows ?? [], emotionIntensity: day.emotion_intensity ?? null, skill: day.skill_text ?? '', requestReflection: day.request_reflection ?? {requestText:'',connection:'',action:''} };
}
export function partnerLine(text: string) {
  const quotes = [...text.matchAll(/«([^»]+)»/g)].map(match => match[1]);
  return quotes.length ? quotes.join('\n') : text;
}