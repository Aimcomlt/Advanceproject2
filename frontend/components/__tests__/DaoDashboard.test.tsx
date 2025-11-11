import { render, screen } from '@testing-library/react';

import DaoDashboard from '../DaoDashboard';

describe('DaoDashboard', () => {
  it('renders governance metrics and proposals', () => {
    render(
      <DaoDashboard
        name="Literary Sovereignty DAO"
        participationRate={60}
        memberCount={500}
        governanceTokenSymbol="LIB"
        metrics={[{ label: 'Delegates', value: '42' }]}
        proposals={[
          {
            id: 'proposal-1',
            title: 'Fund community translation sprint',
            status: 'Active',
            quorum: '18%',
            votingEnds: 'Aug 04, 2024',
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Literary Sovereignty DAO governance' })).toBeVisible();
    expect(screen.getByText('Delegates')).toBeVisible();
    expect(screen.getByText('Fund community translation sprint')).toBeVisible();
    expect(screen.getByText('Active')).toBeVisible();
  });
});
