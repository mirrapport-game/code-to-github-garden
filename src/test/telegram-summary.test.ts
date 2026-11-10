import {expect,it} from 'vitest';
import {telegramDayText} from '@/lib/telegram-summary';
import {emptyJourney} from '@/lib/challenge-journey';
it('keeps feedback in a Telegram-sized summary even with long reactions',()=>{
  const text=telegramDayText({day:1,stage:'Границы',level:'soft',feelings:[],body:[],hurt:'',shadow:'',resource:'Опора',practice:[],doneAt:'2026-11-10T20:00:00Z',journey:{...emptyJourney(),replay:'Я'.repeat(1500),feedback:'Обратная связь по диалогу',smallStep:'Назови потребность'}});
  expect(text.length).toBeLessThanOrEqual(4000);expect(text).toContain('Обратная связь по диалогу');
});