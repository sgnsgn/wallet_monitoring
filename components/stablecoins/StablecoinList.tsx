"use client";

import { Asset } from "@prisma/client";
import { CryptoData } from "@/lib/coinmarketcap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface StablecoinListProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
}

export default function StablecoinList({ assets, prices, isLoading }: StablecoinListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateStablecoinValue = (asset: Asset) => {
    const currentPrice =
      prices[asset.symbol.toUpperCase()]?.quote.USD.price ||
      parseFloat(asset.purchasePrice.toString());
    const currentValue = currentPrice * parseFloat(asset.quantity.toString());
    return {
      currentPrice,
      currentValue,
    };
  };

  // Filtrer les actifs de type stablecoins
  const stablecoinAssets = assets.filter((asset) => asset.classification.toLowerCase() === "stablecoin");

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Stablecoin Holdings</h2>
      {isLoading ? (
        <div className="mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 border-gray-700">
                <TableHead className="text-white">Asset</TableHead>
                <TableHead className="text-white">Blockchain</TableHead>
                <TableHead className="text-white">Quantity</TableHead>
                <TableHead className="text-white">Current Price</TableHead>
                <TableHead className="text-white">Current Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stablecoinAssets.map((asset) => {
                const { currentPrice, currentValue } = calculateStablecoinValue(asset);

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
                    <TableCell>{formatCurrency(currentPrice)}</TableCell>
                    <TableCell>{formatCurrency(currentValue)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
