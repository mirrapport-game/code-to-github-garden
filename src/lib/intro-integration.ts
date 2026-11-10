import { SHADOW_SHADES } from '@/lib/shadow-shades';

export type IntroIntegration = {
  quality: string;
  step: 'meaning' | 'manifestations' | 'reaction' | 'feelings' | 'balance' | 'resource' | 'summary';
  ratingBefore?: number;
  ratingAfter?: number;
  afterFeelings?: string[];
  meaning: string;
  where: string;
  afraid: string;
  reactionId: string;
  personalReaction: string;
  after: string;
  balance: string;
  resource: string;
  smallStep: string;
};
const qualities: Record<string, { name: string; shadow: string; integrated: string }> = {
  'Наглой': {name:'Наглость',shadow:'',integrated:''},
  'Напористой': {name:'Напористость',shadow:'Давить, торопить другого и не слышать его отказ.',integrated:'Настойчиво обозначать свою цель и договариваться, оставляя другому право отказаться.'},
  'Резкой': {name:'Резкость',shadow:'Ранить словами, обрывать разговор, обесценивать другого.',integrated:'Коротко и ясно остановить то, что не подходит, без унижения другого.'},
  'Холодной': {name:'Холодность',shadow:'',integrated:''},
  'Слабой': {name:'Слабость',shadow:'',integrated:''},
  'Уязвимой': {name:'Уязвимость',shadow:'Скрывать свои чувства из стыда или ждать, что другой сам догадается и всё исправит.',integrated:'Признавать свои чувства и просить о поддержке, выбирая безопасного собеседника.'},
  'Эгоистичной': {name:'Эгоизм',shadow:'Считать важными только свои желания и игнорировать потребности другого.',integrated:'Учитывать свои потребности наравне с чужими, не отказываясь от себя.'},
  'Упрямой': {name:'Упрямство',shadow:'Спорить ради победы и не менять решение даже при новых обстоятельствах.',integrated:'Сохранять верность важному для себя и оставаться открытой к новым фактам.'},
  'Контролирующей': {name:'Контроль',shadow:'',integrated:''},
  'Независимой': {name:'Независимость',shadow:'Отказываться от любой поддержки и обрывать связь, чтобы ни от кого не зависеть.',integrated:'Принимать свои решения и при этом позволять себе близость и помощь.'},
  'Смелой': {name:'Смелость',shadow:'Игнорировать опасность или доказывать свою силу любой ценой.',integrated:'Действовать ради важного для себя, учитывая риск и собственные возможности.'},
  'Прямой': {name:'Прямота',shadow:'Говорить всё без оглядки на чужие чувства и оправдывать грубость честностью.',integrated:'Честно называть свои чувства и желания без обвинений и унижения.'},
  'Требовательной': {name:'Требовательность',shadow:'Требовать невозможного и наказывать за несовпадение с ожиданиями.',integrated:'Ясно договариваться об условиях и обозначать, что для тебя приемлемо.'},
  'Мягкой': {name:'Мягкость',shadow:'Уступать против своего желания, избегая любого недовольства.',integrated:'Сохранять тепло в общении и при этом говорить ясное «нет».'},
};
export function integrationProfile(quality: string) {
  const profile = qualities[quality];
  if (!profile) return undefined;
  const author = SHADOW_SHADES.find(shade => shade.name === profile.name);
  return author ? {name:author.name,shadow:author.shadow,integrated:author.integrated} : profile;
}
export function pickIntegrationQuality(selected: string[]): string | undefined {
  return selected.find(quality => Boolean(integrationProfile(quality)));
}
export function emptyIntegration(quality: string): IntroIntegration {
  return {quality,step:'meaning',meaning:'',where:'',afraid:'',reactionId:'',personalReaction:'',after:'',balance:'',resource:'',smallStep:''};
}
const clearReactions: Record<string,string> = {
  'Наглой':'Скажу: «Я тоже хочу заявить о своём желании. Мне важно, чтобы его услышали; ты можешь не согласиться».',
  'Напористой':'Скажу: «Это для меня важно, и я хочу вернуться к разговору. Какие условия нам обоим подойдут?»',
  'Резкой':'Коротко скажу: «Стоп. Такой тон мне не подходит. Продолжим без оскорблений».',
  'Холодной':'Скажу: «Я слышу твои чувства, но сейчас не готова включаться. Мне нужно спокойно разобраться».',
  'Слабой':'Скажу: «Я сейчас не справляюсь. Мне нужна помощь, и я не хочу скрывать это».',
  'Уязвимой':'Скажу: «Мне больно и тревожно. Я хочу рассказать об этом и попросить, чтобы меня выслушали».',
  'Эгоистичной':'Скажу: «Я учту твои желания, но мои тоже важны. Я не готова соглашаться против себя».',
  'Упрямой':'Скажу: «В этом для меня есть важный принцип. Я готова услышать новые факты, но не хочу уступать только из страха».',
  'Контролирующей':'Скажу: «Давай уточним, за что отвечаю я, а что остаётся твоим решением. Я не буду решать всё за тебя».',
  'Независимой':'Скажу: «Я приму своё решение сама. При этом могу услышать тебя и попросить о поддержке».',
  'Смелой':'Скажу: «Мне страшно, но я хочу назвать своё желание. Сначала проверю, безопасно ли продолжать этот разговор».',
  'Прямой':'Скажу: «Я чувствую это и хочу вот этого. Говорю о себе, не оценивая тебя».',
  'Требовательной':'Скажу: «Для меня приемлемы такие условия. Давай договоримся, что каждый из нас действительно может сделать».',
  'Мягкой':'Скажу тепло: «Мне важен наш контакт, но сейчас я не согласна. Давай поищем другой вариант».',
};
export function integrationReactions(quality: string) {
  const profile = integrationProfile(quality);
  if (!profile) return [];
  return [
    {id:'pressure',kind:'shadow',text:'Надавлю: «Будет по-моему. Твои возражения меня не интересуют».',feedback:'Здесь есть действие, но нет места чужим границам. Как взять силу качества, не подавляя другого?'},
    {id:'clear',kind:'integrated',text:clearReactions[quality] ?? '',feedback:profile.integrated},
    {id:'hide',kind:'shadow',text:'Скрою своё желание: «Всё нормально, сделаем как ты хочешь», хотя мне это не подходит.',feedback:'Здесь свои потребности остаются невысказанными. Что ты могла бы позволить себе назвать прямо?'},
    {id:'pause',kind:'integrated',text:'Скажу: «Мне нужна пауза. Я решу, что мне подходит, и вернусь с ответом; если небезопасно — выйду из разговора».',feedback:'Пауза может помочь выбрать свою меру качества. Она не обязывает тебя возвращаться в небезопасный контакт.'},
  ];
}
export function canContinueIntegration(value: IntroIntegration): boolean {
  const filled = (...items: string[]) => items.every(item => Boolean(item.trim()));
  switch (value.step) {
    case 'meaning': return Boolean(integrationProfile(value.quality)) && filled(value.where,value.afraid) && Number.isInteger(value.ratingBefore) && (value.ratingBefore ?? 0) >= 1 && (value.ratingBefore ?? 11) <= 10;
    case 'manifestations': return true;
    case 'reaction': return integrationReactions(value.quality).some(reaction => reaction.id === value.reactionId);
    case 'feelings': return Boolean(value.afterFeelings?.length) && Number.isInteger(value.ratingAfter) && (value.ratingAfter ?? 0) >= 1 && (value.ratingAfter ?? 11) <= 10;
    case 'balance': return filled(value.balance);
    case 'resource': return filled(value.resource,value.smallStep);
    case 'summary': return true;
  }
}