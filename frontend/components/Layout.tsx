import Link from 'next/link';
import { useRouter } from 'next/router';
import type { PropsWithChildren, ReactNode } from 'react';
import { Fragment } from 'react';

import { WalletControls } from './WalletControls';
import { cn } from '../lib/utils';

type NavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  trailing?: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    match: (path) => path === '/',
  },
  {
    href: '/reader/demo',
    label: 'Reader',
    match: (path) => path.startsWith('/reader'),
    trailing: <span className="rounded bg-brand/10 px-2 py-0.5 text-xs text-brand">Beta</span>,
  },
];

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-brand-foreground text-slate-900">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand">
            Literary Sovereignty
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
            {NAV_ITEMS.map((item) => {
              const isActive = item.match(router.pathname);
              return (
                <Fragment key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 transition-colors hover:text-brand',
                      isActive ? 'text-brand' : 'text-slate-600',
                    )}
                  >
                    {item.label}
                    {item.trailing}
                  </Link>
                </Fragment>
              );
            })}
          </nav>
          <WalletControls />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      <footer className="border-t border-slate-200/60 bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Literary Sovereignty.</p>
          <div className="flex items-center gap-4">
            <Link href="/reader/demo">Reader</Link>
            <Link href="https://wagmi.sh" target="_blank" rel="noreferrer">
              Powered by Wagmi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
