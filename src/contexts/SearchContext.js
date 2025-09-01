'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onSearch, setOnSearch] = useState(() => () => {});
  const pathname = usePathname();

  const getSearchConfig = useCallback(() => {
    switch (pathname) {
      case '/users':
        return {
          placeholder: 'Search by name, email, user ID, phone, or location...',
          ariaLabel: 'Search users',
          description: 'Enter keywords to search for users'
        };
      case '/payments':
        return {
          placeholder: 'Search by Redemption ID or User ID...',
          ariaLabel: 'Search payments',
          description: 'Enter keywords to search for payment transactions'
        };
      default:
        return {
          placeholder: 'Search for games or users....',
          ariaLabel: 'Search',
          description: 'Enter keywords to search for games or users'
        };
    }
  }, [pathname]);

  const registerSearchHandler = useCallback((handler) => {
    setOnSearch(() => handler);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchTerm(query);
    onSearch(query);
  }, [onSearch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    onSearch('');
  }, [onSearch]);

  const value = {
    searchTerm,
    setSearchTerm,
    handleSearch,
    clearSearch,
    registerSearchHandler,
    searchConfig: getSearchConfig(),
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};