export const REQUEST_METHODS = [
  {id:'situation',title:'Способ 1. Вспомни ситуацию, которая вызвала сильные чувства',prompt:'Вспомни последнюю ситуацию, которая вызвала у тебя сильные эмоции. Злость, стыд, страх, обиду, зависть, бессилие. Что произошло? Что сказали тебе? Что ты сказала себе?'},
  {id:'pattern',title:'Способ 2. Вспомни повторяющийся сценарий',prompt:'Есть ли у тебя ситуация, которая повторяется в твоей жизни? В разных отношениях, с разными людьми — но финал один и тот же? Что это за сценарий? Что ты чувствуешь в конце?'},
  {id:'character',title:'Способ 3. Выбери персонажа',prompt:'Представь, что ты — режиссёр. Ты создаёшь персонажа для игры. Какой персонаж хочет выйти на сцену? Может быть, это та, кто смеётся, когда ей больно? Или та, кто говорит «нет»? Или та, кто плачет? Что она хочет сказать или прожить?'},
] as const;
export type RequestMethod = typeof REQUEST_METHODS[number]['id'];
export type ChallengeRequest = {mode:'with'|'without';method:RequestMethod;text:string;confirmed:boolean};
export function requestReady(request?:ChallengeRequest):boolean {
  return request?.mode==='without' || Boolean(request?.confirmed && request.text.trim());
}
export function activeRequest(request?:ChallengeRequest):string | undefined {
  return request?.mode==='with' && requestReady(request) ? request.text : undefined;
}