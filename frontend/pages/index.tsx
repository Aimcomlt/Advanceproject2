import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Literary Sovereignty | Reader</title>
      </Head>
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            A sovereign reading experience for on-chain literature.
          </h1>
          <p className="text-lg text-slate-600">
            The Literary Sovereignty frontend provides a reader-focused interface for browsing,
            collecting, and supporting decentralized publications. Connect your wallet to personalize
            the experience.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/reader/demo"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand/90"
            >
              Open Reader
            </Link>
            <a
              href="https://literarysovereignty.xyz"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand hover:bg-brand/10"
            >
              Project Overview
            </a>
          </div>
        </div>
        <div className="relative flex h-full flex-col gap-4 rounded-3xl border border-brand/20 bg-white p-6 shadow-xl">
          <p className="text-xs uppercase text-slate-400">Preview</p>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-brand-foreground p-4">
            <p className="text-sm font-semibold text-slate-700">Reader demo</p>
            <p className="text-sm text-slate-600">
              Navigate to <code className="rounded bg-slate-100 px-1 py-0.5">/reader/&lt;address&gt;</code> to
              load an on-chain publication profile.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-brand-foreground p-4">
            <p className="text-sm font-semibold text-slate-700">Web3 ready</p>
            <p className="text-sm text-slate-600">
              Wallet connections, ENS resolution, and network switching are preconfigured with wagmi and
              viem.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
