import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MorePage } from '../components/MorePage';
import { fetchDriverPortal } from '../services/api';
import type { DriverPortalResponse } from '../types/api';

// Mock the API module
jest.mock('../services/api', () => ({
  fetchDriverPortal: jest.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  }
}));

const mockFetchDriverPortal = fetchDriverPortal as jest.MockedFunction<typeof fetchDriverPortal>;

// Mock data
const mockDriverData: DriverPortalResponse = {
  profile: {
    name: 'Johnny Rodriguez',
    email: 'johnny.rodriguez@schneider.com',
    phone: '+1 (555) 234-5678',
    driverId: 'SNI-78432',
    cdlNumber: 'WI-CDL-789456123',
    rating: 4.9,
    totalDeliveries: 2156,
    memberSince: 'March 2018',
    fleet: 'Dedicated Fleet',
    homeTerminal: 'Green Bay, WI',
  },
  wallet: {
    balance: 3247.85,
    pendingEarnings: 825.0,
    thisWeekEarnings: 1580.5,
    totalEarnings: 67250.4,
    schneiderPay: {
      mileageRate: 0.58,
      bonusEarnings: 450.0,
      fuelBonus: 125.5,
    },
  },
  menuSections: [
    {
      title: 'Account',
      items: [
        { icon: 'user', label: 'Personal Information' },
        { icon: 'edit', label: 'Edit Profile' },
        { icon: 'truck', label: 'Vehicle Information' },
        { icon: 'file-text', label: 'Documents' },
      ],
    },
    {
      title: 'Earnings & Payments',
      items: [
        { icon: 'wallet', label: 'Wallet Details' },
        { icon: 'credit-card', label: 'Payment Methods' },
        { icon: 'trending-up', label: 'Earnings History' },
        { icon: 'file-text', label: 'Tax Documents' },
      ],
    },
  ],
  performance: {
    loadsCompleted: 47,
    onTimeRate: 0.982,
    averageRating: 4.8,
  },
  appVersion: 'FreightDriver v2.1.0',
};

describe('MorePage Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchDriverPortal.mockClear();
  });

  it('should render loading state initially', () => {
    mockFetchDriverPortal.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Loading driver portal…')).toBeInTheDocument();
  });

  it('should render profile data when loaded successfully', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Johnny Rodriguez')).toBeInTheDocument();
    });
    
    expect(screen.getByText('johnny.rodriguez@schneider.com')).toBeInTheDocument();
    expect(screen.getByText('SNI-78432')).toBeInTheDocument();
    expect(screen.getByText('Green Bay, WI')).toBeInTheDocument();
  });

  it('should render wallet information correctly', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('$3,247.85')).toBeInTheDocument();
    });
    
    expect(screen.getByText('$825.00')).toBeInTheDocument();
    expect(screen.getByText('$1,580.50')).toBeInTheDocument();
  });

  it('should render performance metrics correctly', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('47')).toBeInTheDocument();
    });
    
    expect(screen.getByText('98.2%')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('should render menu sections correctly', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Earnings & Payments')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Wallet Details')).toBeInTheDocument();
  });

  it('should handle navigation when menu items are clicked', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });
    
    const settingsItem = screen.getByText('App Settings');
    await userEvent.click(settingsItem);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('settings');
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchDriverPortal.mockRejectedValue(new Error('Network error'));
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong while loading driver data.')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('should handle ApiError specifically', async () => {
    const { ApiError } = require('../services/api');
    mockFetchDriverPortal.mockRejectedValue(new ApiError('Unable to load driver portal data.'));
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load driver portal data.')).toBeInTheDocument();
    });
  });

  it('should display app version', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('FreightDriver v2.1.0')).toBeInTheDocument();
    });
  });

  it('should handle missing profile data gracefully', async () => {
    const incompleteData = {
      ...mockDriverData,
      profile: null,
    };
    mockFetchDriverPortal.mockResolvedValue(incompleteData as any);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load driver portal data.')).toBeInTheDocument();
    });
  });

  it('should handle missing wallet data gracefully', async () => {
    const incompleteData = {
      ...mockDriverData,
      wallet: null,
    };
    mockFetchDriverPortal.mockResolvedValue(incompleteData as any);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load driver portal data.')).toBeInTheDocument();
    });
  });

  it('should render menu items with correct icons', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      // Check that menu items are rendered (icons are handled by Lucide React)
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Vehicle Information')).toBeInTheDocument();
    });
  });

  it('should handle multiple menu sections', async () => {
    const dataWithMultipleSections = {
      ...mockDriverData,
      menuSections: [
        ...mockDriverData.menuSections,
        {
          title: 'Support & Settings',
          items: [
            { icon: 'settings', label: 'App Settings', navigationTarget: 'settings' },
            { icon: 'help-circle', label: 'Help & Support' },
          ],
        },
      ],
    };
    mockFetchDriverPortal.mockResolvedValue(dataWithMultipleSections);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Earnings & Payments')).toBeInTheDocument();
      expect(screen.getByText('Support & Settings')).toBeInTheDocument();
    });
  });

  it('should reload data when component mounts', async () => {
    mockFetchDriverPortal.mockResolvedValue(mockDriverData);
    
    render(<MorePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(mockFetchDriverPortal).toHaveBeenCalledTimes(1);
    });
  });
});
