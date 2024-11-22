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

interface AssetListProps {
  assets: Asset[];
  prices: { [key: string]: CryptoData };
  isLoading: boolean;
  onNavigate?: (view: string) => void; // Optionnel pour les vues nécessitant la navigation
  columnConfig: string[]; // Configuration pour activer/désactiver les colonnes
}

export default function AssetList({
  assets,
  prices,
  isLoading,
  columnConfig,
  onNavigate,
}: AssetListProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

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

    return { currentPrice, currentValue, profitLoss, profitLossPercentage };
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
    <div className="mt-10">
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800 border-gray-700 hover:bg-gray-700">
              {columnConfig.includes("asset") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("asset")}
                >
                  Asset {sortColumn === "asset" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("wallet") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("wallet")}
                >
                  Wallet {sortColumn === "wallet" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("quantity") && (
                <TableHead className="text-white">Quantity</TableHead>
              )}
              {columnConfig.includes("currentPrice") && (
                <TableHead className="text-white">Current Price</TableHead>
              )}
              {columnConfig.includes("currentValue") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("currentValue")}
                >
                  Current Value{" "}
                  {sortColumn === "currentValue" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("plDollar") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("plDollar")}
                >
                  P/L ($) {sortColumn === "plDollar" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("plPercent") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("plPercent")}
                >
                  P/L (%) {sortColumn === "plPercent" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("change1h") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("change1h")}
                >
                  Change (1h){" "}
                  {sortColumn === "change1h" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("change24h") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("change24h")}
                >
                  Change (24h){" "}
                  {sortColumn === "change24h" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {columnConfig.includes("change7d") && (
                <TableHead
                  className="text-white cursor-pointer"
                  onClick={() => handleSort("change7d")}
                >
                  Change (7d){" "}
                  {sortColumn === "change7d" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </TableHead>
              )}
              {onNavigate && <TableHead className="text-white"></TableHead>}
              {columnConfig.includes("link") && (
                <TableHead className="text-white"></TableHead>
              )}
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

              const priceData = prices[asset.symbol.toUpperCase()]?.quote.USD || {};
              const percentChange1h = priceData.percent_change_1h || 0;
              const percentChange24h = priceData.percent_change_24h || 0;
              const percentChange7d = priceData.percent_change_7d || 0;

              const Icon = getTradeTypeIcon(asset.type);

              return (
                <TableRow key={asset.id} className="border-gray-700 hover:bg-gray-800">
                  {columnConfig.includes("asset") && (
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{asset.name}</span>
                        <span className="text-gray-400">({asset.symbol})</span>
                      </div>
                    </TableCell>
                  )}
                  {columnConfig.includes("wallet") && <TableCell>{asset.wallet}</TableCell>}
                  {columnConfig.includes("quantity") && (
                    <TableCell>{parseFloat(asset.quantity.toString())}</TableCell>
                  )}
                  {columnConfig.includes("currentPrice") && (
                    <TableCell>{formatCurrency(currentPrice)}</TableCell>
                  )}
                  {columnConfig.includes("currentValue") && (
                    <TableCell>{formatCurrency(currentValue)}</TableCell>
                  )}
                  {columnConfig.includes("plDollar") && (
                    <TableCell
                      className={profitLoss >= 0 ? "text-green-400" : "text-red-400"}
                    >
                      {formatCurrency(profitLoss)}
                    </TableCell>
                  )}
                  {columnConfig.includes("plPercent") && (
                    <TableCell
                      className={profitLossPercentage >= 0 ? "text-green-400" : "text-red-400"}
                    >
                      {profitLossPercentage.toFixed(2)}%
                    </TableCell>
                  )}
                  {columnConfig.includes("change1h") && (
                    <TableCell
                      className={percentChange1h >= 0 ? "text-green-400" : "text-red-400"}
                    >
                      {percentChange1h.toFixed(2)}%
                    </TableCell>
                  )}
                  {columnConfig.includes("change24h") && (
                    <TableCell
                      className={percentChange24h >= 0 ? "text-green-400" : "text-red-400"}
                    >
                      {percentChange24h.toFixed(2)}%
                    </TableCell>
                  )}
                  {columnConfig.includes("change7d") && (
                    <TableCell
                      className={percentChange7d >= 0 ? "text-green-400" : "text-red-400"}
                    >
                      {percentChange7d.toFixed(2)}%
                    </TableCell>
                  )}
                  {onNavigate && (
                    <TableCell>
                      <button onClick={() => onNavigate(asset.type.toLowerCase())}>
                        <Icon className="text-blue-400 hover:text-white" />
                      </button>
                    </TableCell>
                  )}
                  {columnConfig.includes("link") && (
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
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
