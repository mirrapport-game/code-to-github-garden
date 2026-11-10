import { integrationProfile, integrationReactions } from '@/lib/intro-integration';

export const PRACTICE_FEELINGS = ['Радость','Лёгкость','Уверенность','Спокойствие','Интерес','Надежда','Облегчение','Благодарность','Гордость','Тепло','Вдохновение','Удивление','Страх','Обида','Вина','Грусть','Злость','Стыд','Тревога','Растерянность'];
export function validPracticeRating(rating?: number): boolean {
  return rating !== undefined && Number.isInteger(rating) && rating >= 1 && rating <= 10;
}
export function practiceRatingQuestion(name:string, quality?:string) {
  if (quality) return `Насколько ты ${quality.toLocaleLowerCase('ru-RU').replace(/ой$/, 'а').replace(/ей$/, 'я')}?`;
  return `Насколько тебе свойственно это качество — «${name}»?`;
}
export function practiceReactions(name:string, integrated:string) {
  const quality = ['Наглой','Напористой','Резкой','Холодной','Слабой','Уязвимой','Эгоистичной','Упрямой','Контролирующей','Независимой','Смелой','Прямой','Требовательной','Мягкой'].find(item=>integrationProfile(item)?.name === name);
  if (quality) return integrationReactions(quality);
  return [
    {id:'pressure',kind:'shadow',text:'Настою на своём любой ценой, не буду слушать возражения.',feedback:''},
    {id:'clear',kind:'integrated',text:`Попробую проявить «${name}» бережно: ${integrated} Скажу о своём желании и выслушаю ответ.`,feedback:''},
    {id:'hide',kind:'shadow',text:'Откажусь от своего желания и соглашусь, хотя внутри мне это не подходит.',feedback:''},
    {id:'pause',kind:'integrated',text:'Возьму паузу, замечу свои потребности и вернусь к разговору без давления. Если небезопасно — выйду из ситуации.',feedback:''},
  ];
}
export function practiceSupport(name:string, integrated:string) {
  const steps:Record<string,string> = {
    'Напористость':'В безопасном разговоре назови одну важную для тебя цель и спроси: «Какие условия нам обоим подойдут?»',
    'Наглость':'В безопасной ситуации скажи одно своё желание: «Я тоже хочу…» — и оставь другому право отказаться.',
    'Слабость':'Попроси надёжного человека об одной конкретной небольшой помощи.',
    'Уязвимость':'Поделись одним чувством с человеком, которому доверяешь, и попроси тебя выслушать.',
    'Холодность':'Если нужен отдых, спокойно скажи: «Сейчас мне нужна пауза» — без обесценивания другого.',
    'Мягкость':'Сохраняя тёплый тон, обозначь одно небольшое «нет» там, где тебе безопасно.',
  };
  return {resource:`Право выбирать свою меру качества «${name}», сохраняя свои и чужие границы. Твоя опора: ${integrated}`,smallStep:steps[name] ?? `В одном безопасном разговоре попробуй «${name}» в небольшой дозе: назови своё желание, выслушай ответ и разреши себе паузу.`};
}