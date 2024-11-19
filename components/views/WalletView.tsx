"use client";

import { useState, useEffect, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ViewHeader from "../ViewHeader";

export default function WalletView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { prices, isLoading: pricesLoading, fetchPrices, lastUpdated } =
    useCryptoPrices();

  useEffect(() => {
    fetchAssets();
    fetchPrices();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/assets");
      const data = await response.json();

      if (response.ok) {
        setAssets(data); // Pas de filtre ici, on utilise tous les assets
      } else {
        console.error("Failed to fetch assets:", data.error);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const classificationMap = useMemo(() => {
    const map: { [key: string]: number } = {};

    assets.forEach((asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
      const value = currentPrice * parseFloat(asset.quantity.toString());

      let classification = asset.classification.toLowerCase();
      if (["large cap", "mid cap", "small cap", "micro cap"].includes(classification)) {
        classification = "altcoins";
      }

      if (map[classification]) {
        map[classification] += value;
      } else {
        map[classification] = value;
      }
    });

    return map;
  }, [assets, prices]);

  const totalPortfolioValue = useMemo(() => {
    return Object.values(classificationMap).reduce((sum, value) => sum + value, 0);
  }, [classificationMap]);

  const chartData = useMemo(() => {
    const labels = Object.keys(classificationMap);
    const data = Object.values(classificationMap);
    const percentages = data.map((value) =>
      ((value / totalPortfolioValue) * 100).toFixed(2)
    );

    return {
      labels: labels.map((label, index) => `${label} (${percentages[index]}%)`),
      datasets: [
        {
          data,
          backgroundColor: [
            "#4caf50", // Vert
            "#ff9800", // Orange
            "#03a9f4", // Bleu
            "#e91e63", // Rose
            "#9c27b0", // Violet
            "#ffc107", // Jaune
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [classificationMap, totalPortfolioValue]);

  return (
    <>
    <ViewHeader
      title="Wallet"
      lastUpdated={lastUpdated}
      onRefresh={fetchPrices}
    />
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
        Wallet Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Portfolio Value */}
        <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
            Total Portfolio Value
          </h2>
          {isLoading || pricesLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-3xl font-bold text-green-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalPortfolioValue)}
            </p>
          )}
        </Card>

        {/* Classification Chart */}
        <Card className="p-6 bg-gray-800 border-gray-700 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-400 text-center">
            Classification Breakdown
          </h2>
          {isLoading || pricesLoading ? (
            <Skeleton className="h-48 w-48" />
          ) : (
            <div className="w-64 h-64">
              <Doughnut
                data={chartData}
                options={{
                  plugins: {
                    legend: { display: true, position: "bottom" },
                  },
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}
