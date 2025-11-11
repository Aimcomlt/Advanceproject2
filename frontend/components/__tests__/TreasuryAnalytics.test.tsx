import { render, screen } from '@testing-library/react';

import TreasuryAnalytics from '../TreasuryAnalytics';

describe('TreasuryAnalytics', () => {
  it('renders treasury summary and allocations', () => {
    render(
      <TreasuryAnalytics
        totalBalance="1,245 ETH"
        runwayMonths={12}
        monthlyBurn="50 ETH"
        lastUpdated="July 27, 2024"
        allocations={[
          { category: 'Operations', percentage: 40, amount: '400 ETH' },
          { category: 'Grants', percentage: 60, amount: '600 ETH' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Treasury analytics' })).toBeVisible();
    expect(screen.getByText('1,245 ETH')).toBeVisible();
    expect(screen.getByText('Operations')).toBeVisible();
    expect(screen.getByText('Grants')).toBeVisible();
  });
});
