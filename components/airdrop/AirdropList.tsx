"use client";

import { useState } from "react";
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
import { ExternalLink } from "lucide-react";

interface AirdropListProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
}

export default function AirdropList({ assets, prices, isLoading }: AirdropListProps) {
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

  const calculateAirdropValue = (asset: Asset) => {
    const currentPrice =
      prices[asset.symbol.toUpperCase()]?.quote.USD.price ||
      parseFloat(asset.purchasePrice.toString());
    const currentValue = currentPrice * parseFloat(asset.quantity.toString());
    const percentChange1h =
      prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_1h || 0;
    const percentChange24h =
      prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
    const percentChange7d =
      prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_7d || 0;

    return {
      currentPrice,
      currentValue,
      percentChange1h,
      percentChange24h,
      percentChange7d,
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
      case "wallet":
        aValue = a.wallet.toLowerCase();
        bValue = b.wallet.toLowerCase();
        break;
      case "currentValue":
        aValue = prices[a.symbol.toUpperCase()]?.quote.USD.price * a.quantity || 0;
        bValue = prices[b.symbol.toUpperCase()]?.quote.USD.price * b.quantity || 0;
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

  const airdropAssets = sortedAssets.filter(
    (asset) => asset.origin.toLowerCase() === "airdrop"
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Airdrop Holdings</h2>
      {isLoading ? (
        <div className="mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
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
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("wallet")}
                >
                  Wallet {sortColumn === "wallet" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
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
                <TableHead className="text-white">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {airdropAssets.map((asset) => {
                const {
                  currentPrice,
                  currentValue,
                  percentChange1h,
                  percentChange24h,
                  percentChange7d,
                } = calculateAirdropValue(asset);

                return (
                  <TableRow key={asset.id} className="border-gray-700">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{asset.name}</span>
                        <span className="text-gray-400">({asset.symbol})</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.wallet}</TableCell>
                    <TableCell>{parseFloat(asset.quantity.toString()).toFixed(8)}</TableCell>
                    <TableCell>{formatCurrency(currentPrice)}</TableCell>
                    <TableCell>{formatCurrency(currentValue)}</TableCell>
                    <TableCell
                      className={`font-bold ${
                        percentChange1h >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {percentChange1h.toFixed(2)}%
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        percentChange24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {percentChange24h.toFixed(2)}%
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        percentChange7d >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {percentChange7d.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://coinmarketcap.com/fr/currencies/${asset.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                      </a>
                    </TableCell>
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