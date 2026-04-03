import { cn } from '../lib/utils';

type Allocation = {
  category: string;
  percentage: number;
  amount: string;
};

type TreasuryAnalyticsProps = {
  totalBalance: string;
  runwayMonths: number;
  monthlyBurn: string;
  lastUpdated: string;
  allocations: Allocation[];
  className?: string;
};

const TreasuryAnalytics = ({
  totalBalance,
  runwayMonths,
  monthlyBurn,
  lastUpdated,
  allocations,
  className,
}: TreasuryAnalyticsProps) => {
  return (
    <section className={cn('space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow', className)}>
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Treasury analytics</h2>
        <p className="text-sm text-slate-500">Last updated {lastUpdated}</p>
      </header>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Total balance</dt>
          <dd className="text-lg font-semibold text-slate-900">{totalBalance}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Runway</dt>
          <dd className="text-lg font-semibold text-slate-900">{runwayMonths} months</dd>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-brand-foreground px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Monthly burn</dt>
          <dd className="text-lg font-semibold text-slate-900">{monthlyBurn}</dd>
        </div>
      </dl>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Allocation</h3>
        <ul className="space-y-3">
          {allocations.map((allocation) => (
            <li key={allocation.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                <span>{allocation.category}</span>
                <span>
                  {allocation.amount} • {allocation.percentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(Math.max(allocation.percentage, 0), 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-slate-500">
        Replace these aggregates with live treasury reads once contract ABIs are exposed. Historical graphs can be layered in
        with charting once data endpoints stabilize.
      </p>
    </section>
  );
};

export type { Allocation, TreasuryAnalyticsProps };
export default TreasuryAnalytics;
