import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from '../src/components/SearchPage';

// Mock the global fetch API for the purpose of this test. We return
// predefined responses for profiles, origins and destinations. Subsequent
// calls (for the search) return an empty array by default.
beforeEach(() => {
  global.fetch = jest.fn()
    // First call: profiles
    .mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          {
            id: '1',
            name: 'Test Profile',
            origin: 'Chicago, IL',
            destination: 'Madison, WI',
            originRadius: 10,
            destinationRadius: 20
          }
        ])
    })
    // Second call: origins
    .mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },
          { city: 'Madison', state: 'WI', displayName: 'Madison, WI' }
        ])
    })
    // Third call: destinations
    .mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { city: 'Chicago', state: 'IL', displayName: 'Chicago, IL' },
          { city: 'Madison', state: 'WI', displayName: 'Madison, WI' }
        ])
    })
    // Fourth call: search results (empty)
    .mockResolvedValue({
      json: () => Promise.resolve([])
    }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('selecting a profile populates the origin and destination fields', async () => {
  render(<SearchPage />);
  // Wait until the profile option appears
  const select = await screen.findByLabelText(/Profile/i);
  // Select the test profile by its option value (id)
  await userEvent.selectOptions(select, '1');
  // The origin and destination input boxes should now contain the values from the profile
  const originInput = screen.getByLabelText(/Origin/i) as HTMLInputElement;
  const destinationInput = screen.getByLabelText(/Destination/i) as HTMLInputElement;
  expect(originInput.value).toBe('Chicago, IL');
  expect(destinationInput.value).toBe('Madison, WI');
});