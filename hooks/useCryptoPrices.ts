"use client";

import { useState } from 'react';
import { CryptoData } from '@/lib/coinmarketcap';

export function useCryptoPrices() {
  const [prices, setPrices] = useState<{ [key: string]: CryptoData }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/prices');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch prices');
      }

      setPrices(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  };

  return { prices, isLoading, error, fetchPrices, lastUpdated };
}