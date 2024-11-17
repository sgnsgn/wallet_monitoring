"use client";

import { Asset } from '@prisma/client';
import { formatDistance } from 'date-fns';
import { CryptoData } from '@/lib/coinmarketcap';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface AssetListProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
  onUpdate: () => void;
}

export default function AssetList({ assets, prices, isLoading, onUpdate }: AssetListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateProfitLoss = (asset: Asset) => {
    const currentPrice = prices[asset.symbol.toUpperCase()]?.quote.USD.price || 
                        parseFloat(asset.purchasePrice.toString());
    const purchaseValue = parseFloat(asset.purchasePrice.toString()) * parseFloat(asset.quantity.toString());
    const currentValue = currentPrice * parseFloat(asset.quantity.toString());
    const profitLoss = currentValue - purchaseValue;
    const profitLossPercentage = (profitLoss / purchaseValue) * 100;

    return {
      currentPrice,
      currentValue,
      value: profitLoss,
      percentage: profitLossPercentage,
    };
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Assets</h2>
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 border-gray-700">
              <TableHead className="text-white">Asset</TableHead>
              <TableHead className="text-white">Blockchain</TableHead>
              <TableHead className="text-white">Quantity</TableHead>
              <TableHead className="text-white">Purchase Price</TableHead>
              <TableHead className="text-white">Current Price</TableHead>
              <TableHead className="text-white">Current Value</TableHead>
              <TableHead className="text-white">P/L</TableHead>
              <TableHead className="text-white">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const { currentPrice, currentValue, value: profitLoss, percentage } = calculateProfitLoss(asset);
              return (
                <TableRow key={asset.id} className="border-gray-700">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{asset.name}</span>
                      <span className="text-gray-400">({asset.symbol})</span>
                    </div>
                  </TableCell>
                  <TableCell>{asset.blockchain}</TableCell>
                  <TableCell>{parseFloat(asset.quantity.toString()).toFixed(8)}</TableCell>
                  <TableCell>{formatCurrency(parseFloat(asset.purchasePrice.toString()))}</TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      formatCurrency(currentPrice)
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      formatCurrency(currentValue)
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : (
                      <span className={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(profitLoss)} ({percentage.toFixed(2)}%)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDistance(new Date(asset.createdAt), new Date(), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}