"use client";

import { useMemo } from "react";
import { Asset } from "@prisma/client";
import { CryptoData } from "@/lib/coinmarketcap";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AirdropOverviewProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
}

export default function AirdropOverview({
  assets,
  prices,
  isLoading,
}: AirdropOverviewProps) {
  // Filtrer uniquement les actifs airdropés
  const airdropAssets = useMemo(() => {
    return assets.filter((asset) => asset.origin.toLowerCase() === "airdrop");
  }, [assets]);

  // Nombre total d'actifs airdropés
  const totalAssets = airdropAssets.length;

  // Valeur totale des actifs airdropés
  const totalValue = useMemo(() => {
    return airdropAssets.reduce((total, asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
      return total + currentPrice * parseFloat(asset.quantity.toString());
    }, 0);
  }, [airdropAssets, prices]);

  // Changement moyen sur 24h pour les actifs airdropés
  const average24hChange = useMemo(() => {
    if (airdropAssets.length === 0) return 0;

    const totalChange = airdropAssets.reduce((total, asset) => {
      const percentChange24h =
        prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
      const currentValue =
        (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
        parseFloat(asset.quantity.toString());
      return total + (currentValue * percentChange24h) / 100;
    }, 0);

    return (totalChange / totalValue) * 100 || 0; // Moyenne pondérée
  }, [airdropAssets, prices, totalValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Airdrops */}
      <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
          Total Airdrops
        </h2>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-3xl font-bold text-blue-400">{totalAssets}</p>
        )}
      </Card>

      {/* Total Value */}
      <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
          Total Value
        </h2>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-3xl font-bold text-green-400">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalValue)}
          </p>
        )}
      </Card>

      {/* Average 24h Change */}
      <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
          24h Change
        </h2>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p
            className={`text-3xl font-bold ${
              average24hChange >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {average24hChange.toFixed(2)}%
          </p>
        )}
      </Card>
    </div>
  );
}
