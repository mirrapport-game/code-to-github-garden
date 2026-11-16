import {z} from 'zod';
export const BOOKING_LABELS = {live:'Записаться на живую игру',online:'Сыграть в онлайн',consultation:'Записаться на консультацию'} as const;
export const bookingSchema = z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(100),phone:z.string().trim().max(40).refine(value=>{const digits=value.replace(/\D/g,'');return digits.length>=10&&digits.length<=15;},'Укажи телефон с кодом страны'),kind:z.enum(['live','online','consultation'])});
export type BookingKind = keyof typeof BOOKING_LABELS;