"use client";

import { useMemo } from "react";
import { Asset } from "@prisma/client";
import { CryptoData } from "@/lib/coinmarketcap";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StablecoinOverviewProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
}

export default function StablecoinOverview({
  assets,
  prices,
  isLoading,
}: StablecoinOverviewProps) {
  // Filtrer uniquement les actifs Stablecoinés
  const StablecoinAssets = useMemo(() => {
    return assets.filter((asset) => asset.trade_type.toLowerCase() === "stablecoin");
  }, [assets]);

  // Nombre total d'actifs Stablecoinés
  const totalAssets = StablecoinAssets.length;

  // Valeur totale des actifs Stablecoinés
  const totalValue = useMemo(() => {
    return StablecoinAssets.reduce((total, asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
      return total + currentPrice * parseFloat(asset.quantity.toString());
    }, 0);
  }, [StablecoinAssets, prices]);

  // Changement moyen sur 24h pour les actifs Stablecoinés
  const average24hChange = useMemo(() => {
    if (StablecoinAssets.length === 0) return 0;

    const totalChange = StablecoinAssets.reduce((total, asset) => {
      const percentChange24h =
        prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
      const currentValue =
        (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
        parseFloat(asset.quantity.toString());
      return total + (currentValue * percentChange24h) / 100;
    }, 0);

    return (totalChange / totalValue) * 100 || 0; // Moyenne pondérée
  }, [StablecoinAssets, prices, totalValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Stablecoins */}
      <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
          Total Stablecoins
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