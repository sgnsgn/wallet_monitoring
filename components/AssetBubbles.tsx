"use client";

import { Asset } from "@prisma/client";
import { CryptoData } from "@/lib/coinmarketcap";
import { useMemo } from "react";

interface AssetBubblesProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
}

export default function AssetBubbles({ assets, prices }: AssetBubblesProps) {
  // Calculer la valeur totale
  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
      return sum + currentPrice * parseFloat(asset.quantity.toString());
    }, 0);
  }, [assets, prices]);

  // Calculer les bulles
  const bubbles = useMemo(() => {
    return assets.map((asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
      const value = currentPrice * parseFloat(asset.quantity.toString());
      const percentChange24h =
        prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;

      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        value,
        percentChange24h,
        size: Math.max(50, Math.min(200, (value / totalValue) * 300)), // Taille dynamique
        color: percentChange24h >= 0 ? "bg-green-500" : "bg-red-500",
      };
    });
  }, [assets, prices, totalValue]);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-6 p-4">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`rounded-full flex items-center justify-center text-white font-bold ${bubble.color}`}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            aspectRatio: "1 / 1", // Assure une forme ronde
          }}
        >
          <div className="text-center">
            <p className="text-sm">{bubble.symbol}</p>
            <p className="text-xs">${bubble.value.toFixed(2)}</p>
            <p className="text-xs">{bubble.percentChange24h.toFixed(2)}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}
