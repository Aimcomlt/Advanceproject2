import { useMemo } from 'react';

import { cn, formatAddress } from '../lib/utils';

type ReaderMetric = {
  label: string;
  value: string;
  helperText?: string;
};

type ReaderBadge = {
  label: string;
  description: string;
};

type ReaderProfileProps = {
  ensName?: string | null;
  address?: `0x${string}` | string;
  avatarUrl?: string | null;
  bio?: string | null;
  metrics: ReaderMetric[];
  badges?: ReaderBadge[];
  className?: string;
};

const ReaderProfile = ({
  ensName,
  address,
  avatarUrl,
  bio,
  metrics,
  badges = [],
  className,
}: ReaderProfileProps) => {
  const displayHandle = useMemo(() => {
    if (ensName) return ensName;
    if (address) return formatAddress(address);
    return 'Unknown reader';
  }, [ensName, address]);

  const secondaryHandle = useMemo(() => {
    if (ensName && address) return address;
    return null;
  }, [ensName, address]);

  const initials = useMemo(() => displayHandle.slice(0, 2).toUpperCase(), [displayHandle]);

  return (
    <section className={cn('space-y-6 rounded-3xl border border-brand/20 bg-white p-6 shadow', className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-3xl font-semibold text-brand">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayHandle} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-900">{displayHandle}</h1>
            {secondaryHandle ? <p className="text-sm text-slate-500">{secondaryHandle}</p> : null}
            {bio ? <p className="text-sm text-slate-600">{bio}</p> : null}
          </div>
        </div>
        {badges.length ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-medium text-brand"
                title={badge.description}
              >
                {badge.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</dt>
            <dd className="text-xl font-semibold text-slate-900">{metric.value}</dd>
            {metric.helperText ? (
              <p className="text-xs text-slate-500">{metric.helperText}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
};

export type { ReaderMetric, ReaderBadge, ReaderProfileProps };
export default ReaderProfile;
