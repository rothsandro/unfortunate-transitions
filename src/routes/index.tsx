import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { SocialLinks } from '@/ui/social-links';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Ghosts />
      <Container>
        <h1
          className="max-w-[12ch] bg-linear-to-b from-slate-50 to-slate-300 bg-clip-text font-spooky
            text-8xl text-transparent"
        >
          Unfortunate Transitions
        </h1>
        <p className="mt-12 font-serif text-3xl leading-tight font-medium italic">
          State by state, <span className="text-accent not-italic">seal their fate.</span>
        </p>
        <p
          className="mt-12 inline-flex items-center gap-2 rounded border border-slate-600 px-2 py-1
            font-mono text-accent"
        >
          <ArrowRight size={20} /> Chapter I: Silent Night
        </p>
        <div className="mt-16">
          <Link
            to="/chapters/silent-night"
            className="rounded bg-white px-8 py-4 font-serif text-2xl text-black"
          >
            Play Now
          </Link>
        </div>
      </Container>
    </>
  );
}

function Container(props: PropsWithChildren) {
  const { children } = props;

  return (
    <div
      className="relative grid min-h-screen grid-rows-[1fr_auto] items-center
        before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:block
        before:bg-[radial-gradient(circle_at_20%_30%,rgba(125,211,252,0.15)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.08)_0%,transparent_35%)]
        before:content-['']"
    >
      <main className="mx-auto p-8 text-center">{children}</main>
      <footer className="flex flex-wrap items-center justify-between gap-3 px-8 py-4">
        <p className="text-sm text-slate-400">
          An unfortunate creation by{' '}
          <a
            href="https://sandroroth.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300"
          >
            Sandro Roth
          </a>
        </p>
        <SocialLinks />
      </footer>
    </div>
  );
}

function Ghosts() {
  const ghosts = [
    'top-[15%] left-[12%] text-8xl opacity-[0.12]',
    'right-[15%] bottom-[20%] text-7xl opacity-[0.08] [animation-delay:-3s]',
    'top-[60%] left-[8%] text-5xl opacity-[0.06] [animation-delay:-2s]',
  ];

  return (
    <>
      {ghosts.map((className) => (
        <div
          key={className}
          className={'pointer-events-none absolute animate-float select-none ' + className}
          aria-hidden="true"
        >
          👻
        </div>
      ))}
    </>
  );
}
