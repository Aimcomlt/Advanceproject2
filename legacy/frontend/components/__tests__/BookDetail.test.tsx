import { render, screen } from '@testing-library/react';

import BookDetail from '../BookDetail';

describe('BookDetail', () => {
  it('renders book metadata and chapters', () => {
    render(
      <BookDetail
        title="Fragments of a Decentralized Library"
        description="An evolving anthology"
        genre="Speculative fiction"
        publicationStatus="Season 2"
        stats={[{ label: 'Chapters', value: '3 / 12' }]}
        chapters={[
          { title: 'Chapter 1', status: 'Published', wordCount: 1234 },
          { title: 'Chapter 2', status: 'Scheduled', wordCount: 4567, releaseDate: 'Aug 10' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Fragments of a Decentralized Library' })).toBeVisible();
    expect(screen.getByText('Chapter 1')).toBeVisible();
    expect(screen.getByText('Chapter 2')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Collect edition' })).toBeEnabled();
  });
});
