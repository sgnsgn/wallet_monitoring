// cardConfigs.ts

import { Asset } from "@prisma/client";
import { CryptoData } from "@/lib/coinmarketcap";

export const cardConfigs = {
  global: [
    {
      key: "totalAssets",
      title: "Total Assets",
      value: (assets: Asset[]) => assets.length,
      format: (value: number) => value.toString(),
      isVisible: true,
    },
    {
      key: "totalValue",
      title: "Total Value",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return total + currentPrice * parseFloat(asset.quantity.toString());
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      isVisible: true,
    },
    {
      key: "totalPL",
      title: "Total P/L",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          const purchasePrice = parseFloat(asset.purchasePrice.toString());
          const quantity = parseFloat(asset.quantity.toString());
          const currentValue = currentPrice * quantity;
          const investedValue = purchasePrice * quantity;
          return total + (currentValue - investedValue);
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
    {
      key: "average24hChange",
      title: "24h Change",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) => {
        const totalValue = assets.reduce((sum, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return sum + currentPrice * parseFloat(asset.quantity.toString());
        }, 0);

        const totalChange = assets.reduce((total, asset) => {
          const percentChange24h =
            prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
          const currentValue =
            (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
            parseFloat(asset.quantity.toString());
          return total + (currentValue * percentChange24h) / 100;
        }, 0);

        return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
      },
      format: (value: number) => `${value.toFixed(2)}%`,
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
  ],
  swing: [
    {
      key: "totalAssets",
      title: "Total Assets",
      value: (assets: Asset[]) => assets.length,
      format: (value: number) => value.toString(),
      isVisible: true,
    },
    {
      key: "totalValue",
      title: "Total Value",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return total + currentPrice * parseFloat(asset.quantity.toString());
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      isVisible: true,
    },
    {
      key: "totalPL",
      title: "Total P/L",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          const purchasePrice = parseFloat(asset.purchasePrice.toString());
          const quantity = parseFloat(asset.quantity.toString());
          const currentValue = currentPrice * quantity;
          const investedValue = purchasePrice * quantity;
          return total + (currentValue - investedValue);
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
    {
      key: "average24hChange",
      title: "24h Change",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) => {
        const totalValue = assets.reduce((sum, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return sum + currentPrice * parseFloat(asset.quantity.toString());
        }, 0);

        const totalChange = assets.reduce((total, asset) => {
          const percentChange24h =
            prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
          const currentValue =
            (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
            parseFloat(asset.quantity.toString());
          return total + (currentValue * percentChange24h) / 100;
        }, 0);

        return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
      },
      format: (value: number) => `${value.toFixed(2)}%`,
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
  ],
  airdrop: [
    {
      key: "totalAssets",
      title: "Total Stablecoins",
      value: (assets: Asset[]) => assets.length,
      format: (value: number) => value.toString(),
      isVisible: true,
    },
    {
      key: "totalValue",
      title: "Total Value",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return total + currentPrice * parseFloat(asset.quantity.toString());
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      isVisible: true,
    },
    {
      key: "average24hChange",
      title: "24h Change",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) => {
        const totalValue = assets.reduce((sum, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return sum + currentPrice * parseFloat(asset.quantity.toString());
        }, 0);

        const totalChange = assets.reduce((total, asset) => {
          const percentChange24h =
            prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
          const currentValue =
            (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
            parseFloat(asset.quantity.toString());
          return total + (currentValue * percentChange24h) / 100;
        }, 0);

        return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
      },
      format: (value: number) => `${value.toFixed(2)}%`,
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
  ],
  stacking: [
    {
      key: "totalAssets",
      title: "Total Assets",
      value: (assets: Asset[]) => assets.length,
      format: (value: number) => value.toString(),
      isVisible: true,
    },
    {
      key: "totalValue",
      title: "Total Value",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return total + currentPrice * parseFloat(asset.quantity.toString());
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      isVisible: true,
    },
    {
      key: "totalPL",
      title: "Total P/L",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          const purchasePrice = parseFloat(asset.purchasePrice.toString());
          const quantity = parseFloat(asset.quantity.toString());
          const currentValue = currentPrice * quantity;
          const investedValue = purchasePrice * quantity;
          return total + (currentValue - investedValue);
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
    {
      key: "average24hChange",
      title: "24h Change",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) => {
        const totalValue = assets.reduce((sum, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return sum + currentPrice * parseFloat(asset.quantity.toString());
        }, 0);

        const totalChange = assets.reduce((total, asset) => {
          const percentChange24h =
            prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
          const currentValue =
            (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
            parseFloat(asset.quantity.toString());
          return total + (currentValue * percentChange24h) / 100;
        }, 0);

        return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
      },
      format: (value: number) => `${value.toFixed(2)}%`,
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
  ],
  stablecoin: [
    {
      key: "totalAssets",
      title: "Total Stablecoins",
      value: (assets: Asset[]) => assets.length,
      format: (value: number) => value.toString(),
      isVisible: true,
    },
    {
      key: "totalValue",
      title: "Total Value",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) =>
        assets.reduce((total, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return total + currentPrice * parseFloat(asset.quantity.toString());
        }, 0),
      format: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
      isVisible: true,
    },
    {
      key: "average24hChange",
      title: "24h Change",
      value: (assets: Asset[], prices: { [key: string]: CryptoData }) => {
        const totalValue = assets.reduce((sum, asset) => {
          const currentPrice =
            prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
          return sum + currentPrice * parseFloat(asset.quantity.toString());
        }, 0);

        const totalChange = assets.reduce((total, asset) => {
          const percentChange24h =
            prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;
          const currentValue =
            (prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0) *
            parseFloat(asset.quantity.toString());
          return total + (currentValue * percentChange24h) / 100;
        }, 0);

        return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
      },
      format: (value: number) => `${value.toFixed(2)}%`,
      color: (value: number) => (value >= 0 ? "text-green-400" : "text-red-400"),
      isVisible: true,
    },
  ],
};
