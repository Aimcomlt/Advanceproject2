import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { useMemo } from 'react';
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import BookDetail from '../../components/BookDetail';
import DaoDashboard from '../../components/DaoDashboard';
import ReaderProfile from '../../components/ReaderProfile';
import TreasuryAnalytics from '../../components/TreasuryAnalytics';
import { useReaderDashboardData } from '../../lib/hooks/useReaderDashboardData';
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

  const dashboardData = useReaderDashboardData({
    address: addressValue,
    ensName,
    ensAvatar,
    fallbackHandle: address ?? null,
  });

  const displayHandle = useMemo(() => {
    if (ensName) return ensName;
    if (addressValue) return formatAddress(addressValue);
    return address ?? 'Unknown reader';
  }, [address, addressValue, ensName]);

  const isViewingSelf = Boolean(
    connectedAddress && addressValue && connectedAddress.toLowerCase() === addressValue.toLowerCase(),
  );

  return (
    <>
      <Head>
        <title>Reader | {displayHandle}</title>
      </Head>
      <article className="space-y-8">
        <ReaderProfile {...dashboardData.profile} />
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <BookDetail {...dashboardData.book} />
          <div className="space-y-6">
            <DaoDashboard {...dashboardData.dao} />
            <TreasuryAnalytics {...dashboardData.treasury} />
          </div>
        </section>
        {isViewingSelf ? (
          <p className="text-xs text-slate-500">
            You are viewing your live reader dashboard. Contract hooks will automatically hydrate these modules when the backend
            publishes ABIs.
          </p>
        ) : null}
      </article>
    </>
  );
};

export default ReaderPage;
