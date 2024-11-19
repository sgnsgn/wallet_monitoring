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
import {
  Globe,
  Gift,
  DollarSign,
  Lock,
  Briefcase,
  Wallet,
  Activity,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AssetListProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
  setActiveView: (view: string) => void; // Ajout de la fonction setActiveView
}

export default function AssetList({ assets, prices, isLoading, setActiveView }: AssetListProps) {
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
      profitLoss,
      profitLossPercentage,
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

  const getTradeTypeIcon = (tradeType: string) => {
    switch (tradeType.toLowerCase()) {
      case "airdrop":
        return Gift;
      case "stacking":
        return Lock;
      case "stablecoin":
        return DollarSign;
      case "swing":
        return Briefcase;
      case "wallet":
        return Wallet;
      case "trade":
        return Activity;
      default:
        return Globe;
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: number | string | null = null;
    let bValue: number | string | null = null;

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
      case "plDollar":
        aValue =
          (prices[a.symbol.toUpperCase()]?.quote.USD.price * a.quantity || 0) -
          a.purchasePrice * a.quantity;
        bValue =
          (prices[b.symbol.toUpperCase()]?.quote.USD.price * b.quantity || 0) -
          b.purchasePrice * b.quantity;
        break;
      case "plPercent":
        const aPL =
          (prices[a.symbol.toUpperCase()]?.quote.USD.price * a.quantity || 0) -
          a.purchasePrice * a.quantity;
        const bPL =
          (prices[b.symbol.toUpperCase()]?.quote.USD.price * b.quantity || 0) -
          b.purchasePrice * b.quantity;
        aValue = (aPL / (a.purchasePrice * a.quantity)) * 100 || 0;
        bValue = (bPL / (b.purchasePrice * b.quantity)) * 100 || 0;
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
      return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    }
  });

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Assets</h2>
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 border-gray-700 hover:bg-gray-700">
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
                onClick={() => handleSort("plDollar")}
              >
                P/L ($) {sortColumn === "plDollar" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead
                className="text-white cursor-pointer"
                onClick={() => handleSort("plPercent")}
              >
                P/L (%) {sortColumn === "plPercent" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
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
              const {
                currentPrice,
                currentValue,
                profitLoss,
                profitLossPercentage,
              } = calculateProfitLoss(asset);

              const priceData = prices[asset.symbol.toUpperCase()]?.quote.USD;
              const percentChange1h = priceData?.percent_change_1h || 0;
              const percentChange24h = priceData?.percent_change_24h || 0;
              const percentChange7d = priceData?.percent_change_7d || 0;

              const Icon = getTradeTypeIcon(asset.trade_type);

              return (
                <TableRow key={asset.id} className="border-gray-700  hover:bg-gray-800">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{asset.name}</span>
                      <span className="text-gray-400">({asset.symbol})</span>
                    </div>
                  </TableCell>
                  <TableCell>{asset.wallet}</TableCell>
                  <TableCell>{formatCurrency(currentPrice)}</TableCell>
                  <TableCell>{formatCurrency(currentValue)}</TableCell>
                  <TableCell
                    className={profitLoss >= 0 ? "text-green-400" : "text-red-400"}
                  >
                    {formatCurrency(profitLoss)}
                  </TableCell>
                  <TableCell
                    className={profitLossPercentage >= 0 ? "text-green-400" : "text-red-400"}
                  >
                    {profitLossPercentage.toFixed(2)}%
                  </TableCell>
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
                    <button
                      onClick={() => setActiveView(asset.trade_type.toLowerCase())} // Appelle setActiveView
                    >
                      <Icon className="text-blue-400 hover:text-white" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://coinmarketcap.com/currencies/${asset.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-400 hover:text-white" />
                    </a>
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
