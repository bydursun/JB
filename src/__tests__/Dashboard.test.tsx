import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { applicationAPI, jobAPI } from '../services/api';

jest.mock('../contexts/AuthContext', () => {
  const actual = jest.requireActual('../contexts/AuthContext') as any;
  return { ...actual, useAuth: jest.fn() };
});
jest.mock('../services/api', () => {
  const actual = jest.requireActual('../services/api') as any;
  return {
    ...actual,
    jobAPI: { ...actual.jobAPI, getMyJobs: jest.fn() },
    applicationAPI: { ...actual.applicationAPI, getMyApplications: jest.fn() },
  };
});
jest.mock('../components/LoadingSpinner', () => () => <div>Loading...</div>);

const mockUseAuth = useAuth as unknown as jest.Mock;
const jobApiSpy = jobAPI.getMyJobs as unknown as jest.Mock;
const appApiSpy = applicationAPI.getMyApplications as unknown as jest.Mock;

const renderDashboard = async (role: 'employer' | 'jobseeker') => {
  const asyncStub = jest.fn(async () => {});
  mockUseAuth.mockReturnValue({
    user: { id: 'user-1', name: 'Pat', role, email: 'pat@test.com' },
    token: null,
    login: asyncStub,
    register: asyncStub,
    logout: jest.fn(),
    updateProfile: asyncStub,
    loading: false,
  });

  if (role === 'employer') {
    jobApiSpy.mockResolvedValue({
      data: {
        data: { jobs: [{ _id: '1', title: 'Role', company: 'Co', createdAt: new Date().toISOString(), applicationCount: 2 }] },
        pagination: { totalJobs: 1 },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as any);
  } else {
    appApiSpy.mockResolvedValue({
      data: {
        data: { applications: [{ _id: 'a1', status: 'pending', createdAt: new Date().toISOString(), jobId: { title: 'Role', company: 'Co' } }] },
        pagination: { totalApplications: 1 },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as any);
  }

  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  await screen.findByText(/welcome back/i);
};

describe('Dashboard', () => {
  it('shows employer stats cards', async () => {
    await renderDashboard('employer');

    await waitFor(() => expect(jobApiSpy).toHaveBeenCalled());
    expect(screen.getByText(/total jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/applications/i)).toBeInTheDocument();
  });

  it('shows jobseeker stats cards', async () => {
    await renderDashboard('jobseeker');

    await waitFor(() => expect(appApiSpy).toHaveBeenCalled());
    expect(screen.getByText(/applications/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
  });
});
