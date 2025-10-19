import React from 'react';
import SearchPage from './components/SearchPage';

/**
 * Top-level React component. Renders the SearchPage which contains all
 * controls for selecting an origin, destination, profile and running a
 * search against the backend.
 */
const App: React.FC = () => {
  return <SearchPage />;
};

export default App;