"use client";

import { useState, useEffect } from "react";
import StablecoinOverview from "@/components/stablecoin/StablecoinOverview";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog";
import BubblePacking from "@/components/BubblePacking";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import AssetList from "../AssetList";
import { prepareBubbleData } from "@/app/utils/prepareBubbleData";

export default function StablecoinView() {
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
          (asset: Asset) => asset.trade_type === "stablecoin"
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

  const enhancedBubbleData = prepareBubbleData(assets, prices);

  return (
    <div>
      <ViewHeader
        title="Stablecoin Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)}
        onToggleView={() => setIsBubbleView(!isBubbleView)}
        isBubbleView={isBubbleView}
        isRefreshing={pricesLoading}
      />

      <StablecoinOverview assets={assets} prices={prices} isLoading={isLoading} />

      {isBubbleView ? (
        <BubblePacking data={enhancedBubbleData} />
      ) : (
        <AssetList
        assets={assets}
        prices={prices}
        isLoading={isLoading}
        columnConfig={[
          "asset",
          "wallet",
          "quantity",
          "currentPrice",
          "currentValue",
          "change1h",
          "change24h",
          "change7d",
          "link",
        ]}
      />
      )}

      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAssetAdded={fetchAssets}
        defaultTradeType="stablecoin"
      />
    </div>
  );
}
