import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { Ghost } from 'lucide-react';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  errorComponent: ErrorComponent,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Unfortunate Transitions',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-950 text-slate-100">
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8" role="alert">
      <div className="max-w-lg text-center">
        <Ghost className="mx-auto mb-6 text-slate-600" size={80} strokeWidth={1.5} />
        <h1 className="font-spooky text-5xl text-slate-300">Something Went Wrong</h1>
        <p className="mt-6 font-serif text-xl text-slate-400">
          The spirits have encountered an unexpected disturbance in the haunting realm.
        </p>
        <p className="mt-4 font-serif text-lg text-slate-500">
          Try returning to the mortal world and starting your journey anew.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-slate-800 px-6 py-3 font-medium text-slate-100
            transition-all hover:bg-slate-700 active:scale-[.97]"
          reloadDocument
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
