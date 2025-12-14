import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../contexts/AuthContext';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
  };
});
jest.mock('../contexts/AuthContext', () => {
  const actual = jest.requireActual('../contexts/AuthContext') as any;
  return { ...actual, useAuth: jest.fn() };
});

const mockLogin = jest.fn() as jest.MockedFunction<(email: string, password: string) => Promise<void>>;
const mockNavigate = jest.fn();
const mockUseLocation = useLocation as jest.Mock;
const mockUseAuth = useAuth as unknown as jest.Mock;

const renderLogin = (
  authOverride?: Partial<ReturnType<typeof useAuth>>,
  locationState?: any
) => {
  const asyncStub = jest.fn(async () => {});
  mockUseAuth.mockReturnValue({
    user: null,
    login: mockLogin,
    token: null,
    register: asyncStub,
    logout: jest.fn(),
    updateProfile: asyncStub,
    loading: false,
    ...authOverride,
  });
  (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  mockUseLocation.mockReturnValue(locationState ?? { state: undefined });

  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Login />
    </MemoryRouter>
  );
};

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits credentials and navigates', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jobseeker@demo.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    expect(mockLogin).toHaveBeenCalledWith('jobseeker@demo.com', 'password123');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('shows error when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jobseeker@demo.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('redirects immediately if already authenticated', () => {
    renderLogin(
      { user: { id: 'user-1', email: 'pat@test.com', name: 'Pat', role: 'jobseeker' } },
      { state: { from: { pathname: '/profile' } } }
    );
    expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
  });
});
