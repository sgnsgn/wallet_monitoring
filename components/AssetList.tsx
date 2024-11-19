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
import { useState } from "react";

interface AssetListProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
  onUpdate: () => void;
}

export default function AssetList({ assets, prices, isLoading }: AssetListProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateProfitLoss = (asset: Asset) => {
    const currentPrice =
      prices[asset.symbol.toUpperCase()]?.quote.USD.price ||
      parseFloat(asset.purchasePrice.toString());
    const purchaseValue =
      parseFloat(asset.purchasePrice.toString()) *
      parseFloat(asset.quantity.toString());
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: number | string = "";
    let bValue: number | string = "";

    switch (sortColumn) {
      case "asset":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "currentValue":
        aValue = prices[a.symbol.toUpperCase()]?.quote.USD.price * a.quantity || 0;
        bValue = prices[b.symbol.toUpperCase()]?.quote.USD.price * b.quantity || 0;
        break;
      case "pl":
        const aPL =
          (prices[a.symbol.toUpperCase()]?.quote.USD.price * a.quantity || 0) -
          a.purchasePrice * a.quantity;
        const bPL =
          (prices[b.symbol.toUpperCase()]?.quote.USD.price * b.quantity || 0) -
          b.purchasePrice * b.quantity;
        aValue = aPL;
        bValue = bPL;
        break;
      case "change1h":
        aValue = prices[a.symbol.toUpperCase()]?.quote.USD.percent_change_1h || 0;
        bValue = prices[b.symbol.toUpperCase()]?.quote.USD.percent_change_1h || 0;
        break;
      case "change24h":
        aValue = prices[a.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
        bValue = prices[b.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
        break;
      case "change7d":
        aValue = prices[a.symbol.toUpperCase()]?.quote.USD.percent_change_7d || 0;
        bValue = prices[b.symbol.toUpperCase()]?.quote.USD.percent_change_7d || 0;
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Assets</h2>
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 border-gray-700">
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("asset")}
              >
                Asset {sortColumn === "asset" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead className="text-white">Blockchain</TableHead>
              <TableHead className="text-white">Quantity</TableHead>
              <TableHead className="text-white">Current Price</TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("currentValue")}
              >
                Current Value{" "}
                {sortColumn === "currentValue" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("pl")}
              >
                P/L {sortColumn === "pl" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("change1h")}
              >
                Change (1h){" "}
                {sortColumn === "change1h" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("change24h")}
              >
                Change (24h){" "}
                {sortColumn === "change24h" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("change7d")}
              >
                Change (7d){" "}
                {sortColumn === "change7d" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssets.map((asset) => {
              const { currentPrice, currentValue, value: profitLoss, percentage } =
                calculateProfitLoss(asset);
              const priceData = prices[asset.symbol.toUpperCase()]?.quote.USD;
              const percentChange1h = priceData?.percent_change_1h || 0;
              const percentChange24h = priceData?.percent_change_24h || 0;
              const percentChange7d = priceData?.percent_change_7d || 0;

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
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      formatCurrency(prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0)
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      formatCurrency(currentValue)
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : (
                      <span
                        className={
                          profitLoss >= 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {formatCurrency(profitLoss)} ({percentage.toFixed(2)}%)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : (
                      <span
                        className={`font-bold ${
                          percentChange1h >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {percentChange1h.toFixed(2)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : (
                      <span
                        className={`font-bold ${
                          percentChange24h >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {percentChange24h.toFixed(2)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : (
                      <span
                        className={`font-bold ${
                          percentChange7d >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {percentChange7d.toFixed(2)}%
                      </span>
                    )}
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
