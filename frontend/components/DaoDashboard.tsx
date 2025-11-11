import { cn } from '../lib/utils';

type Proposal = {
  id: string;
  title: string;
  status: 'Active' | 'Pending' | 'Executed' | 'Defeated';
  quorum: string;
  votingEnds: string;
};

type GovernanceMetric = {
  label: string;
  value: string;
  helperText?: string;
};

type DaoDashboardProps = {
  name: string;
  participationRate: number;
  memberCount: number;
  governanceTokenSymbol: string;
  proposals: Proposal[];
  metrics: GovernanceMetric[];
  className?: string;
};

const statusStyles: Record<Proposal['status'], string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Executed: 'bg-brand/10 text-brand',
  Defeated: 'bg-rose-100 text-rose-700',
};

const DaoDashboard = ({
  name,
  participationRate,
  memberCount,
  governanceTokenSymbol,
  proposals,
  metrics,
  className,
}: DaoDashboardProps) => {
  return (
    <section className={cn('space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow', className)}>
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{name} governance</h2>
        <p className="text-sm text-slate-600">
          {memberCount.toLocaleString()} members • {participationRate}% participation • Token: {governanceTokenSymbol}
        </p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3">
            <dt className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</dt>
            <dd className="text-lg font-semibold text-slate-900">{metric.value}</dd>
            {metric.helperText ? <p className="text-xs text-slate-500">{metric.helperText}</p> : null}
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Active proposals</h3>
          <span className="text-xs text-slate-500">Ready for contract reads once ABIs land</span>
        </div>
        <ul className="space-y-2">
          {proposals.map((proposal) => (
            <li
              key={proposal.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{proposal.title}</p>
                <p className="text-xs text-slate-500">Quorum {proposal.quorum} • Ends {proposal.votingEnds}</p>
              </div>
              <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', statusStyles[proposal.status])}>
                {proposal.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export type { Proposal, GovernanceMetric, DaoDashboardProps };
export default DaoDashboard;
