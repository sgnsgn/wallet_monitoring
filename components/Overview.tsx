"use client";

import { useMemo } from "react";
import { Asset } from "@prisma/client";
import { CryptoData } from "@/lib/coinmarketcap";
import { cardConfigs } from "@/app/utils/cardConfigs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
  viewType: keyof typeof cardConfigs; // Ex: "global", "stablecoin"
}

export default function Overview({
  assets,
  prices,
  isLoading,
  viewType,
}: OverviewProps) {
  const cardConfig = cardConfigs[viewType];

  const cardValues = useMemo(() => {
    return cardConfig.map((config) => ({
      ...config,
      value: config.value(assets, prices),
    }));
  }, [assets, prices, cardConfig]);

  return (
    <div className={`grid gap-6 mb-8 ${
        cardConfig.length >= 4
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        : cardConfig.length === 3
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : cardConfig.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1"
    }`}
    >

      {cardValues
        .filter((config) => config.isVisible)
        .map((config) => (
          <Card
            key={config.key}
            className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
              {config.title}
            </h2>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p
                className={`text-3xl font-bold ${
                  config.color ? config.color(config.value) : "text-blue-400"
                }`}
              >
                {config.format
                  ? config.format(config.value)
                  : config.value.toString()}
              </p>
            )}
          </Card>
        ))}
    </div>
  );
}
