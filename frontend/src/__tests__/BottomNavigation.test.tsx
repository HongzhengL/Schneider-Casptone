import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNavigation } from '../components/BottomNavigation';

describe('BottomNavigation Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all navigation items', () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Find Loads')).toBeInTheDocument();
    expect(screen.getByText('My Runs')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Driver Portal')).toBeInTheDocument();
  });

  it('should highlight active page correctly', () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).toHaveClass('text-orange-500');
  });

  it('should handle navigation clicks', async () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    const searchButton = screen.getByText('Find Loads');
    await userEvent.click(searchButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('search');
  });

  it('should handle all navigation items', async () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    // Test Home navigation
    await userEvent.click(screen.getByText('Home'));
    expect(mockOnNavigate).toHaveBeenCalledWith('home');
    
    // Test Find Loads navigation
    await userEvent.click(screen.getByText('Find Loads'));
    expect(mockOnNavigate).toHaveBeenCalledWith('search');
    
    // Test My Runs navigation
    await userEvent.click(screen.getByText('My Runs'));
    expect(mockOnNavigate).toHaveBeenCalledWith('results');
    
    // Test Settings navigation
    await userEvent.click(screen.getByText('Settings'));
    expect(mockOnNavigate).toHaveBeenCalledWith('settings');
    
    // Test Driver Portal navigation
    await userEvent.click(screen.getByText('Driver Portal'));
    expect(mockOnNavigate).toHaveBeenCalledWith('more');
  });

  it('should highlight search page for findloadsresults', () => {
    render(<BottomNavigation currentPage="findloadsresults" onNavigate={mockOnNavigate} />);
    
    const findLoadsButton = screen.getByText('Find Loads').closest('button');
    expect(findLoadsButton).toHaveClass('text-orange-500');
  });

  it('should highlight search page for quicksearch', () => {
    render(<BottomNavigation currentPage="quicksearch" onNavigate={mockOnNavigate} />);
    
    const findLoadsButton = screen.getByText('Find Loads').closest('button');
    expect(findLoadsButton).toHaveClass('text-orange-500');
  });

  it('should highlight search page for pickupdate', () => {
    render(<BottomNavigation currentPage="pickupdate" onNavigate={mockOnNavigate} />);
    
    const findLoadsButton = screen.getByText('Find Loads').closest('button');
    expect(findLoadsButton).toHaveClass('text-orange-500');
  });

  it('should highlight search page for dropdate', () => {
    render(<BottomNavigation currentPage="dropdate" onNavigate={mockOnNavigate} />);
    
    const findLoadsButton = screen.getByText('Find Loads').closest('button');
    expect(findLoadsButton).toHaveClass('text-orange-500');
  });

  it('should highlight settings page correctly', () => {
    render(<BottomNavigation currentPage="settings" onNavigate={mockOnNavigate} />);
    
    const settingsButton = screen.getByText('Settings').closest('button');
    expect(settingsButton).toHaveClass('text-orange-500');
  });

  it('should highlight more page correctly', () => {
    render(<BottomNavigation currentPage="more" onNavigate={mockOnNavigate} />);
    
    const moreButton = screen.getByText('Driver Portal').closest('button');
    expect(moreButton).toHaveClass('text-orange-500');
  });

  it('should apply correct styling to active items', () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).toHaveClass('text-orange-500');
    
    const searchButton = screen.getByText('Find Loads').closest('button');
    expect(searchButton).toHaveClass('text-gray-600');
  });

  it('should apply hover styling to inactive items', () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    const searchButton = screen.getByText('Find Loads').closest('button');
    expect(searchButton).toHaveClass('hover:text-orange-500');
  });

  it('should render icons for all navigation items', () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    // Check that all buttons have icons (Lucide React components)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
    
    buttons.forEach(button => {
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('should handle multiple rapid clicks', async () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    const searchButton = screen.getByText('Find Loads');
    
    // Click multiple times rapidly
    await userEvent.click(searchButton);
    await userEvent.click(searchButton);
    await userEvent.click(searchButton);
    
    expect(mockOnNavigate).toHaveBeenCalledTimes(3);
    expect(mockOnNavigate).toHaveBeenCalledWith('search');
  });

  it('should maintain correct layout structure', () => {
    render(<BottomNavigation currentPage="home" onNavigate={mockOnNavigate} />);
    
    const container = screen.getByText('Home').closest('div')?.parentElement?.parentElement;
    expect(container).toHaveClass('fixed', 'bottom-0', 'left-1/2', 'transform', '-translate-x-1/2');
    
    const grid = screen.getByText('Home').closest('div')?.parentElement;
    expect(grid).toHaveClass('grid', 'grid-cols-5', 'gap-1');
  });

  it('should handle edge case page names', () => {
    render(<BottomNavigation currentPage="unknown-page" onNavigate={mockOnNavigate} />);
    
    // Should not highlight any item for unknown pages
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('text-gray-600');
      expect(button).not.toHaveClass('text-orange-500');
    });
  });
});
