import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { useMemo } from 'react';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { formatAddress } from '../../lib/utils';

const ReaderPage: NextPage = () => {
  const router = useRouter();
  const { address } = router.query as { address?: string };
  const normalizedAddress = useMemo(() => (address ? address.toLowerCase() : undefined), [address]);
  const addressValue = useMemo(() => {
    if (!normalizedAddress || !normalizedAddress.startsWith('0x')) {
      return undefined;
    }
    return normalizedAddress as `0x${string}`;
  }, [normalizedAddress]);
  const { data: ensName } = useEnsName({
    address: addressValue,
    chainId: mainnet.id,
    query: { enabled: Boolean(addressValue) },
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
    query: { enabled: Boolean(ensName) },
  });
  const { address: connectedAddress } = useAccount();

  const displayHandle = useMemo(() => {
    if (ensName) return ensName;
    if (addressValue) return formatAddress(addressValue);
    return address ?? 'Unknown reader';
  }, [address, addressValue, ensName]);

  return (
    <>
      <Head>
        <title>Reader | {displayHandle}</title>
      </Head>
      <article className="space-y-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-brand/20 bg-white p-6 shadow">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-3xl text-brand">
              {ensAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ensAvatar} alt={displayHandle} className="h-full w-full object-cover" />
              ) : (
                displayHandle.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-slate-900">{displayHandle}</h1>
              {normalizedAddress ? (
                <p className="text-sm text-slate-500">
                  {normalizedAddress}
                  {connectedAddress && connectedAddress.toLowerCase() === normalizedAddress ? ' · You' : null}
                </p>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-slate-600">
            This is a placeholder reader view. Populate it with publication metadata, chapter navigation,
            and contribution actions as contract features become available.
          </p>
        </header>
        <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
            <p className="text-sm text-slate-600">
              Fetch on-chain events, rich text, or markdown content to render the reader timeline here.
            </p>
          </div>
          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-slate-900">Support this author</h2>
            <p className="text-sm text-slate-600">
              Integrate tipping, patronage tiers, or unlockable content flows using wagmi hooks.
            </p>
          </aside>
        </section>
      </article>
    </>
  );
};

export default ReaderPage;
