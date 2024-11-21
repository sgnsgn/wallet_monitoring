"use client";

import { useState, useEffect } from "react";
import SwingOverview from "@/components/Swing/SwingOverview";
import SwingList from "@/components/Swing/SwingList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog";
import BubblePacking from "@/components/BubblePacking";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export default function SwingView() {
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
          (asset: Asset) => asset.trade_type === "swing"
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
  
    const totalValue = currentPrice * parseFloat(asset.quantity.toString());
    const purchaseValue =
      parseFloat(asset.purchasePrice.toString()) *
      parseFloat(asset.quantity.toString());
  
    const normalizedName = asset.name.toLowerCase().trim();
    const normalizedSymbol = asset.symbol.toLowerCase().trim();
  
    const existing = acc.find(
      (b) =>
        b.label.toLowerCase().trim() === normalizedSymbol &&
        b.fullname.toLowerCase().trim() === normalizedName
    );
  
    if (existing) {
      // Ajouter les quantités et valeurs d'achat
      existing.totalQuantity += parseFloat(asset.quantity.toString());
      existing.totalPurchaseValue += purchaseValue;
      existing.value += totalValue;
    } else {
      acc.push({
        id: asset.id.toString(),
        value: totalValue, // Valeur totale actuelle
        totalQuantity: parseFloat(asset.quantity.toString()), // Quantité totale
        totalPurchaseValue: purchaseValue, // Valeur d'achat totale
        label: asset.symbol,
        fullname: asset.name,
        percentage: "0",
        percentChange24h:
          prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0,
        tradeType: asset.trade_type,
      });
    }
  
    return acc;
  }, [] as {
    id: string;
    value: number;
    totalQuantity: number;
    totalPurchaseValue: number;
    label: string;
    fullname: string;
    percentage: string;
    percentChange24h: number;
    tradeType: string;
  }[]);
  
  // Calculer le total des valeurs pour les pourcentages
  const totalValue = bubbleData.reduce((sum, bubble) => sum + bubble.value, 0);

 // Étape 3 : Calculer le P/L final pour chaque bulle
 const enhancedBubbleData = bubbleData.map((bubble) => {
  const averagePurchasePrice = bubble.totalPurchaseValue / bubble.totalQuantity;

  // P/L en pourcentage
  const pl = ((bubble.value / bubble.totalQuantity - averagePurchasePrice) / averagePurchasePrice) * 100;

  // P/L en dollars
  const plValue = bubble.value - bubble.totalPurchaseValue;

  return {
    ...bubble,
    pl, // P/L final en pourcentage
    plValue, // P/L final en dollars
    percentage: ((bubble.value / totalValue) * 100).toFixed(2),
  };
});


  return (
    <div>
      <ViewHeader
        title="Swing Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)}
        onToggleView={() => setIsBubbleView(!isBubbleView)}
        isBubbleView={isBubbleView}
        isRefreshing={pricesLoading}
      />

      <SwingOverview assets={assets} prices={prices} isLoading={isLoading} />

      {isBubbleView ? (
        <BubblePacking data={enhancedBubbleData} />
      ) : (
        <SwingList
          assets={assets}
          prices={prices}
          isLoading={isLoading || pricesLoading}
        />
      )}

      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAssetAdded={fetchAssets}
        defaultTradeType="swing"
      />
    </div>
  );
}
