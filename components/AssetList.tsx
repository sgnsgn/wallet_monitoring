"use client";

import { Asset } from '@prisma/client';
import { formatDistance } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface AssetListProps {
  assets: Asset[];
  onUpdate: () => void;
}

export default function AssetList({ assets, onUpdate }: AssetListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const calculateProfitLoss = (asset: Asset) => {
    // In a real application, you would fetch the current price from an API
    const currentPrice = parseFloat(asset.purchasePrice.toString()); // Placeholder
    const purchaseValue = parseFloat(asset.purchasePrice.toString()) * parseFloat(asset.quantity.toString());
    const currentValue = currentPrice * parseFloat(asset.quantity.toString());
    const profitLoss = currentValue - purchaseValue;
    const profitLossPercentage = (profitLoss / purchaseValue) * 100;

    return {
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
              <TableHead className="text-white">Current Value</TableHead>
              <TableHead className="text-white">P/L</TableHead>
              <TableHead className="text-white">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const profitLoss = calculateProfitLoss(asset);
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
                  <TableCell>{formatCurrency(parseFloat(asset.purchasePrice.toString()) * parseFloat(asset.quantity.toString()))}</TableCell>
                  <TableCell>
                    <span className={profitLoss.value >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(profitLoss.value)} ({profitLoss.percentage.toFixed(2)}%)
                    </span>
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