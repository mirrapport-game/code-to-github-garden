import { Link, createFileRoute } from '@tanstack/react-router';
import box from '@/assets/rapport_box.webp.asset.json';
import { Logo } from '@/components/game-ui';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Раппорт: ЖиваЯ — 7 дней с собой' },
    { name: 'description', content: 'Семь дней знакомства с собой через случайные карты, бережные практики и тест «Как я себя слышу» до и после.' },
    { property: 'og:title', content: 'Раппорт: ЖиваЯ — 7 дней с собой' },
    { property: 'og:description', content: 'Границы, помощь, влияние и другие грани себя в семидневном челлендже.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});
function Index() {
  return <main className="min-h-screen bg-night-gradient text-night-foreground"><div className="mx-auto flex max-w-md flex-col px-6 py-8">
    <header className="flex flex-col items-center text-center animate-rise"><Logo className="h-12 w-12 text-3xl" /><h1 className="mt-4 text-5xl font-semibold text-gold-gradient">Раппорт</h1><p className="font-display text-3xl italic text-gold-soft">— ЖиваЯ —</p></header>
    <img src={box.url} alt="Коробка игры Раппорт ЖиваЯ" className="mt-6 aspect-[4/3] w-full rounded-lg object-cover gold-frame shadow-card" />
    <h2 className="mt-6 text-center text-3xl font-semibold">7 дней с собой</h2>
    <Link to="/season" className="mt-5 block rounded-full bg-gold-gradient px-6 py-4 text-center font-semibold text-accent-foreground shadow-glow">Начать / продолжить челлендж</Link>
    <p className="mt-5 text-center text-sm text-gold-soft">Ближе к себе · ближе к другим</p>
    <p className="mt-4 text-center text-xs text-night-foreground/70">Это игра-зеркало, не психотерапия.</p>
  </div></main>;
}
