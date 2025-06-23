import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import SidebarAdmin from './SidebarAdmin';

// Mocking react-router-dom untuk mengontrol useLocation dan useNavigate
const mockUseLocation = jest.fn();
const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockUseNavigate,
  Link: ({ children, to, onClick, ...rest }) => (
    <a
      href={to}
      onClick={(e) => {
        if (onClick) onClick(e);
        mockUseNavigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  ),
}));

describe('SidebarAdmin Component', () => {
  let isDesktopCollapsed;
  let setDesktopCollapsed;
  let isMobileOpen;
  let setMobileOpen;

  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
      removeItem: jest.fn((key) => { delete store[key]; }),
      clear: jest.fn(() => { store = {}; }),
    };
  })();

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(() => {
    jest.clearAllMocks();
    
    isDesktopCollapsed = false;
    setDesktopCollapsed = jest.fn((val) => { isDesktopCollapsed = val; });
    isMobileOpen = false;
    setMobileOpen = jest.fn((val) => { isMobileOpen = val; });

    mockUseLocation.mockReturnValue({ pathname: '/admin/dashboard' });
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
    localStorageMock.clear();
  });

  const renderComponent = (props = {}) => {
    return render(
      <Router>
        <SidebarAdmin
          isDesktopCollapsed={isDesktopCollapsed}
          setDesktopCollapsed={setDesktopCollapsed}
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
          {...props}
        />
      </Router>
    );
  };

  // Test Case 1: Merender sidebar dengan menu yang benar dan link aktif
  test('renders sidebar with correct menus and active link', () => {
    renderComponent();

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-green-600');
    expect(dashboardLink).toHaveClass('text-white');

    const createLink = screen.getByText('Create').closest('a');
    expect(createLink).not.toHaveClass('bg-green-600');
  });

  // Test Case 2: Menangani navigasi saat menu diklik
  test('handles navigation when a menu item is clicked', () => {
    renderComponent();

    const createLink = screen.getByText('Create').closest('a');
    fireEvent.click(createLink);

    expect(mockUseNavigate).toHaveBeenCalledWith('/admin/create');
    expect(setMobileOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 3: Menangani logout saat tombol logout diklik
  test('handles logout when logout button is clicked', () => {
    renderComponent();

    const logoutButton = screen.getByText('Logout').closest('button');
    fireEvent.click(logoutButton);

    expect(localStorageMock.clear).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith('/login');
  });

  // Test Case 4: Menangani collapse/expand sidebar di desktop
  test('handles sidebar collapse/expand on desktop', () => {
    const { rerender } = renderComponent();

    const adminPanelTextInitial = screen.getByText('Admin Panel');
    expect(adminPanelTextInitial).toHaveClass('aktif');
    expect(adminPanelTextInitial).toHaveClass('opacity-100');


    const collapseButton = screen.getByTitle('Collapse Sidebar');
    fireEvent.click(collapseButton);
    expect(setDesktopCollapsed).toHaveBeenCalledWith(true);

    isDesktopCollapsed = true;
    rerender(
      <Router>
        <SidebarAdmin
          isDesktopCollapsed={isDesktopCollapsed}
          setDesktopCollapsed={setDesktopCollapsed}
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </Router>
    );

    const adminPanelTextCollapsed = screen.getByText('Admin Panel');
    expect(adminPanelTextCollapsed).toHaveClass('aktif');
    expect(adminPanelTextCollapsed).toHaveClass('opacity-0');
    expect(screen.getByText('Dashboard')).toHaveClass('lg:hidden');


    const expandButton = screen.getByTitle('Expand Sidebar'); 
    fireEvent.click(expandButton);
    expect(setDesktopCollapsed).toHaveBeenCalledWith(false);

    isDesktopCollapsed = false;
    rerender(
      <Router>
        <SidebarAdmin
          isDesktopCollapsed={isDesktopCollapsed}
          setDesktopCollapsed={setDesktopCollapsed}
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </Router>
    );

    const adminPanelTextExpanded = screen.getByText('Admin Panel');
    expect(adminPanelTextExpanded).toHaveClass('aktif');
    expect(adminPanelTextExpanded).toHaveClass('opacity-100');
    expect(screen.getByText('Dashboard')).toHaveClass('block');
  });

  // Test Case 5: Kelas CSS untuk sidebar mobile open/close
  test('applies correct CSS classes for mobile open/close', () => {

    const { rerender } = renderComponent();
    expect(screen.getByRole('complementary')).toHaveClass('-translate-x-full'); // Tersembunyi

    isMobileOpen = true;
    rerender(
      <Router>
        <SidebarAdmin
          isDesktopCollapsed={isDesktopCollapsed}
          setDesktopCollapsed={setDesktopCollapsed}
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </Router>
    );
    expect(screen.getByRole('complementary')).toHaveClass('translate-x-0'); // Terlihat
  });
});
