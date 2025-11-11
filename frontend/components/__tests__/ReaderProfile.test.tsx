import { render, screen } from '@testing-library/react';

import ReaderProfile from '../ReaderProfile';

describe('ReaderProfile', () => {
  it('renders ENS name when provided', () => {
    render(
      <ReaderProfile
        ensName="reader.eth"
        address="0x1234567890abcdef1234567890abcdef12345678"
        metrics={[{ label: 'Books collected', value: '5' }]}
        badges={[{ label: 'Founding Reader', description: 'Test badge' }]}
        bio="Test bio"
      />,
    );

    expect(screen.getByRole('heading', { name: 'reader.eth' })).toBeVisible();
    expect(screen.getByText('0x1234567890abcdef1234567890abcdef12345678')).toBeVisible();
    expect(screen.getByText('Books collected')).toBeVisible();
    expect(screen.getByText('Founding Reader')).toBeInTheDocument();
  });

  it('falls back to formatted address when ENS is unavailable', () => {
    render(
      <ReaderProfile
        address="0x1234567890abcdef1234567890abcdef12345678"
        metrics={[{ label: 'Books collected', value: '5' }]}
      />,
    );

    expect(screen.getByRole('heading', { name: '0x1234…5678' })).toBeVisible();
  });
});
