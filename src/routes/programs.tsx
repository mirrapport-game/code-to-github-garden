import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/programs')({
  head: () => ({meta: [
    {title: 'Программы — Раппорт: ЖиваЯ'},
    {name: 'description', content: 'Отдельный модуль «Программы» готовится к открытию.'},
    {property: 'og:title', content: 'Программы — Раппорт: ЖиваЯ'},
    {property: 'og:description', content: 'Модуль в разработке.'},
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary'},
  ]}),
  component: () => <main className="challenge-theme min-h-svh bg-night-gradient px-6 pb-28 pt-16 text-foreground"><div className="mx-auto max-w-md space-y-4"><h1 className="text-4xl">Программы</h1><p className="text-muted-foreground">Модуль в разработке</p></div></main>,
});