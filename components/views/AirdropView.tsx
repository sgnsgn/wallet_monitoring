"use client";

import { useState, useEffect } from "react";
import AirdropOverview from "@/components/Airdrop/AirdropOverview";
import AirdropList from "@/components/Airdrop/AirdropList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog";
import BubblePacking from "@/components/BubblePacking";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export default function AirdropView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBubbleView, setIsBubbleView] = useState(false);
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
        const filteredAssets = data.filter(
          (asset: Asset) => asset.trade_type === "airdrop"
        );
        setAssets(filteredAssets);
      } else {
        console.error("Failed to fetch assets:", data.error);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

// Préparer les données pour BubblePacking
const bubbleData = assets.reduce((acc, asset) => {
  const currentPrice =
    prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;
  const percentChange24h =
    prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0;

  const totalValue = currentPrice * parseFloat(asset.quantity.toString());
  const pl = ((currentPrice - parseFloat(asset.purchasePrice.toString())) /
    parseFloat(asset.purchasePrice.toString())) *
    100;

  // Regrouper les actifs par nom
  const existing = acc.find((b) => b.label === asset.symbol);
  const tradeType = asset.trade_type;

  if (existing) {
    // Mise à jour des valeurs regroupées
    const totalQuantity =
      existing.totalQuantity + parseFloat(asset.quantity.toString());

    // Recalculer le prix d'achat moyen pondéré
    existing.purchasePrice =
      (existing.purchasePrice * existing.totalQuantity +
        parseFloat(asset.purchasePrice.toString()) *
          parseFloat(asset.quantity.toString())) /
      totalQuantity;

    // Mettre à jour les quantités totales et la valeur
    existing.totalQuantity = totalQuantity;
    existing.value += totalValue;

    // Recalculer le P/L global en fonction des valeurs regroupées
    existing.pl =
      ((existing.value - existing.purchasePrice * existing.totalQuantity) /
        (existing.purchasePrice * existing.totalQuantity)) *
      100;
  } else {
    acc.push({
      id: asset.id.toString(),
      value: totalValue,
      label: asset.symbol,
      fullname: asset.name,
      percentChange24h,
      pl,
      tradeType,
      purchasePrice: parseFloat(asset.purchasePrice.toString()), // Initialiser le prix d'achat
      totalQuantity: parseFloat(asset.quantity.toString()), // Initialiser la quantité totale
    });
  }

  return acc;
}, [] as {
  id: string;
  value: number;
  label: string;
  fullname: string;
  percentChange24h: number;
  pl: number;
  tradeType: string;
  purchasePrice: number;
  totalQuantity: number;
}[]);


  // Calculer le total des valeurs pour les pourcentages
  const totalValue = bubbleData.reduce((sum, bubble) => sum + bubble.value, 0);

  // Ajouter les pourcentages et les couleurs dynamiques
  const enhancedBubbleData = bubbleData.map((bubble) => ({
    ...bubble,
    percentage: ((bubble.value / totalValue) * 100).toFixed(2),
  }));

  return (
    <div>
      <ViewHeader
        title="Airdrop Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)}
        onToggleView={() => setIsBubbleView(!isBubbleView)}
        isBubbleView={isBubbleView}
        isRefreshing={pricesLoading}
      />

      <AirdropOverview assets={assets} prices={prices} isLoading={isLoading} />

      {isBubbleView ? (
        <BubblePacking data={enhancedBubbleData} />
      ) : (
        <AirdropList
          assets={assets}
          prices={prices}
          isLoading={isLoading || pricesLoading}
        />
      )}

      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAssetAdded={fetchAssets}
        defaultTradeType="airdrop"
      />
    </div>
  );
}
