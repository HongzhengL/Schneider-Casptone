import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../components/HomePage';
import { fetchSuggestedLoads } from '../services/api';
import type { SuggestedLoad } from '../types/api';

// Mock the API module
jest.mock('../services/api', () => ({
  fetchSuggestedLoads: jest.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  }
}));

const mockFetchSuggestedLoads = fetchSuggestedLoads as jest.MockedFunction<typeof fetchSuggestedLoads>;

// Mock data
const mockSuggestedLoads: SuggestedLoad[] = [
  {
    id: '1',
    fromLocation: 'Green Bay, WI',
    toLocation: 'Denver, CO',
    distance: '320.0 miles',
    loadedRpm: '$1.82',
    loadType: 'Dry Van',
    pickupDate: 'Mon, Oct 20, 6:00 AM',
    dropDate: 'Tue, Oct 21, 12:00 PM',
    price: '$582',
    weight: '38,200 lb',
    customer: 'Walmart',
    confirmedAppointment: true,
    serviceTags: ['driver-assist-load'],
  },
  {
    id: '2',
    fromLocation: 'Chicago, IL',
    toLocation: 'Houston, TX',
    distance: '1,200.0 miles',
    loadedRpm: '$2.15',
    loadType: 'Refrigerated',
    pickupDate: 'Tue, Oct 21, 8:00 AM',
    dropDate: 'Thu, Oct 23, 2:00 PM',
    price: '$2,580',
    weight: '42,500 lb',
    customer: 'Kroger',
    confirmedAppointment: false,
    serviceTags: ['temperature-controlled'],
  },
];

describe('HomePage Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSuggestedLoads.mockClear();
  });

  it('should render loading state initially', () => {
    mockFetchSuggestedLoads.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Loading suggested assignments…')).toBeInTheDocument();
  });

  it('should render Schneider header correctly', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Schneider FreightDriver')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Welcome back, Driver')).toBeInTheDocument();
  });

  it('should render suggested loads when loaded successfully', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Green Bay, WI')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Denver, CO')).toBeInTheDocument();
    expect(screen.getByText('320.0 miles')).toBeInTheDocument();
    expect(screen.getByText('$1.82')).toBeInTheDocument();
    expect(screen.getByText('Dry Van')).toBeInTheDocument();
  });

  it('should handle navigation to search page', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Find Loads')).toBeInTheDocument();
    });
    
    const findLoadsButton = screen.getByText('Find Loads');
    await userEvent.click(findLoadsButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('search');
  });

  it('should handle navigation to notices page', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Notices')).toBeInTheDocument();
    });
    
    const noticesButton = screen.getByText('Notices');
    await userEvent.click(noticesButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('notice');
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchSuggestedLoads.mockRejectedValue(new Error('Network error'));
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong while loading assignments.')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('should handle ApiError specifically', async () => {
    const { ApiError } = require('../services/api');
    mockFetchSuggestedLoads.mockRejectedValue(new ApiError('Unable to load suggested assignments.'));
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load suggested assignments.')).toBeInTheDocument();
    });
  });

  it('should render load cards with correct information', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      // Check first load
      expect(screen.getByText('Green Bay, WI')).toBeInTheDocument();
      expect(screen.getByText('Denver, CO')).toBeInTheDocument();
      expect(screen.getByText('320.0 miles')).toBeInTheDocument();
      expect(screen.getByText('$1.82')).toBeInTheDocument();
      expect(screen.getByText('Dry Van')).toBeInTheDocument();
      expect(screen.getByText('Walmart')).toBeInTheDocument();
      
      // Check second load
      expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
      expect(screen.getByText('Houston, TX')).toBeInTheDocument();
      expect(screen.getByText('1,200.0 miles')).toBeInTheDocument();
      expect(screen.getByText('$2.15')).toBeInTheDocument();
      expect(screen.getByText('Refrigerated')).toBeInTheDocument();
      expect(screen.getByText('Kroger')).toBeInTheDocument();
    });
  });

  it('should display confirmed appointment status', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      // First load has confirmed appointment
      expect(screen.getByText('Confirmed Appointment')).toBeInTheDocument();
    });
  });

  it('should display service tags', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('driver-assist-load')).toBeInTheDocument();
      expect(screen.getByText('temperature-controlled')).toBeInTheDocument();
    });
  });

  it('should handle empty suggested loads', async () => {
    mockFetchSuggestedLoads.mockResolvedValue([]);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('No suggested assignments available.')).toBeInTheDocument();
    });
  });

  it('should handle component unmounting during API call', async () => {
    let resolvePromise: (value: SuggestedLoad[]) => void;
    const promise = new Promise<SuggestedLoad[]>((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchSuggestedLoads.mockReturnValue(promise);
    
    const { unmount } = render(<HomePage onNavigate={mockOnNavigate} />);
    
    // Unmount before API call completes
    unmount();
    
    // Resolve the promise after unmounting
    resolvePromise!(mockSuggestedLoads);
    
    // Should not cause any errors
    expect(mockFetchSuggestedLoads).toHaveBeenCalledTimes(1);
  });

  it('should render action buttons correctly', async () => {
    mockFetchSuggestedLoads.mockResolvedValue(mockSuggestedLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Find Loads')).toBeInTheDocument();
      expect(screen.getByText('Notices')).toBeInTheDocument();
    });
  });

  it('should handle multiple suggested loads', async () => {
    const multipleLoads = [
      ...mockSuggestedLoads,
      {
        id: '3',
        fromLocation: 'Detroit, MI',
        toLocation: 'Atlanta, GA',
        distance: '800.0 miles',
        loadedRpm: '$1.95',
        loadType: 'Flatbed',
        pickupDate: 'Wed, Oct 22, 7:00 AM',
        dropDate: 'Fri, Oct 24, 3:00 PM',
        price: '$1,560',
        weight: '45,000 lb',
        customer: 'Home Depot',
        confirmedAppointment: true,
        serviceTags: ['oversized'],
      },
    ];
    
    mockFetchSuggestedLoads.mockResolvedValue(multipleLoads);
    
    render(<HomePage onNavigate={mockOnNavigate} />);
    
    await waitFor(() => {
      expect(screen.getByText('Green Bay, WI')).toBeInTheDocument();
      expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
      expect(screen.getByText('Detroit, MI')).toBeInTheDocument();
    });
  });
});
