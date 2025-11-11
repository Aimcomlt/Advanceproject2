import { useMemo } from 'react';

import type { BookDetailProps } from '../../components/BookDetail';
import type { DaoDashboardProps } from '../../components/DaoDashboard';
import type { ReaderProfileProps } from '../../components/ReaderProfile';
import type { TreasuryAnalyticsProps } from '../../components/TreasuryAnalytics';

type ReaderDashboardData = {
  profile: ReaderProfileProps;
  book: BookDetailProps;
  dao: DaoDashboardProps;
  treasury: TreasuryAnalyticsProps;
};

type UseReaderDashboardDataArgs = {
  address?: `0x${string}`;
  ensName?: string | null;
  ensAvatar?: string | null;
  fallbackHandle?: string | null;
};

/**
 * Returns memoized dashboard data for the reader view. Replace the mocked
 * objects with contract reads once ABIs become available from the backend.
 */
export function useReaderDashboardData({
  address,
  ensName,
  ensAvatar,
  fallbackHandle,
}: UseReaderDashboardDataArgs): ReaderDashboardData {
  return useMemo(() => {
    const primaryHandle = ensName ?? fallbackHandle ?? undefined;

    const profile: ReaderProfileProps = {
      ensName: primaryHandle,
      address,
      avatarUrl: ensAvatar,
      bio:
        'An early supporter of literary DAOs, curating experimental fiction and publishing on-chain for community-backed patrons.',
      metrics: [
        { label: 'Books collected', value: '12' },
        { label: 'Season pledges', value: '42', helperText: 'Across 3 campaigns' },
        { label: 'Active subscriptions', value: '5' },
        { label: 'Reputation score', value: '88', helperText: 'Snapshot weighted' },
      ],
      badges: [
        { label: 'Founding Reader', description: 'Joined during the genesis mint and holds OG NFT.' },
        { label: 'Top Patron', description: 'Consistently supports new releases above base tier.' },
      ],
    };

    const book: BookDetailProps = {
      title: 'Fragments of a Decentralized Library',
      description:
        'An evolving anthology exploring cooperative publishing, wallet-to-wallet patronage, and the economics of literary sovereignty.',
      genre: 'Speculative fiction',
      publicationStatus: 'Season 2 · Updating weekly',
      stats: [
        { label: 'Chapters', value: '9 / 12' },
        { label: 'Collectors', value: '318' },
        { label: 'Edition floor', value: '0.12 ETH' },
        { label: 'Last update', value: '3 days ago' },
      ],
      chapters: [
        { title: 'Prelude to Sovereignty', status: 'Published', wordCount: 4100 },
        { title: 'Cooperative Patronage', status: 'Published', wordCount: 3680 },
        { title: 'The Index of Trust', status: 'Scheduled', wordCount: 2900, releaseDate: 'Aug 02' },
      ],
      collectActionLabel: 'Prepare collect call',
      onCollect: () => {
        // eslint-disable-next-line no-console
        console.info('Integrate collect contract call when ABIs arrive.');
      },
    };

    const dao: DaoDashboardProps = {
      name: 'Literary Sovereignty DAO',
      participationRate: 62,
      memberCount: 842,
      governanceTokenSymbol: 'LIB',
      metrics: [
        { label: 'Delegates', value: '127', helperText: 'Representing 58% of voting power' },
        { label: 'Quorum threshold', value: '15%', helperText: 'Configurable once contract hooks are wired' },
        { label: 'Current snapshot', value: '#214' },
        { label: 'Last executed', value: 'Proposal 207' },
      ],
      proposals: [
        {
          id: 'proposal-211',
          title: 'Fund community translation sprint',
          status: 'Active',
          quorum: '18%',
          votingEnds: 'Aug 04, 2024',
        },
        {
          id: 'proposal-210',
          title: 'Allocate treasury to artist residency',
          status: 'Pending',
          quorum: '20%',
          votingEnds: 'Aug 12, 2024',
        },
      ],
    };

    const treasury: TreasuryAnalyticsProps = {
      totalBalance: '1,245 ETH',
      runwayMonths: 14,
      monthlyBurn: '68 ETH',
      lastUpdated: 'July 27, 2024',
      allocations: [
        { category: 'Season commissions', percentage: 42, amount: '523 ETH' },
        { category: 'Operations', percentage: 18, amount: '224 ETH' },
        { category: 'Grants & residencies', percentage: 25, amount: '311 ETH' },
        { category: 'Liquidity reserves', percentage: 15, amount: '187 ETH' },
      ],
    };

    return { profile, book, dao, treasury };
  }, [address, ensName, ensAvatar, fallbackHandle]);
}

export type { ReaderDashboardData };
