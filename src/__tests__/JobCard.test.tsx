import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import JobCard from '../components/JobCard';

const baseJob = {
  _id: '123',
  title: 'Frontend Engineer',
  description: 'Build UI features',
  company: 'Acme Corp',
  location: 'Toronto, ON',
  jobType: 'full-time',
  experience: 'mid',
  salary: { min: 80000, max: 110000 },
  createdAt: new Date().toISOString(),
  createdBy: { name: 'Hiring Manager', company: 'Acme Corp' },
};

describe('JobCard', () => {
  it('renders details and link', () => {
    render(
      <MemoryRouter>
        <JobCard job={baseJob} />
      </MemoryRouter>
    );

    expect(screen.getByText(/frontend engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/acme corp/i)).toBeInTheDocument();
    expect(screen.getByText(/toronto/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', '/jobs/123');
  });

  it('formats salary and metadata', () => {
    render(
      <MemoryRouter>
        <JobCard job={baseJob} />
      </MemoryRouter>
    );

    expect(screen.getByText(/\$80,000 - \$110,000/)).toBeInTheDocument();
    expect(screen.getByText(/full time/i)).toBeInTheDocument();
    expect(screen.getByText(/mid level/i)).toBeInTheDocument();
  });
});
