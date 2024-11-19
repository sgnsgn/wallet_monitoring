"use client";

import { useState, useEffect } from "react";
import AirdropOverview from "@/components/airdrop/AirdropOverview";
import AirdropList from "@/components/airdrop/AirdropList";
import ViewHeader from "@/components/ViewHeader";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export default function AirdropView() {
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
        setAssets(data);
      } else {
        console.error("Failed to fetch assets:", data.error);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Vue header */}
      <ViewHeader
        title="Airdrop Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAsset={() => console.log("Add asset triggered")}
        isLoading={pricesLoading}
      />

      {/* Overview */}
      <AirdropOverview assets={assets} prices={prices} isLoading={isLoading} />

      {/* Liste des airdrops */}
      <AirdropList
        assets={assets}
        prices={prices}
        isLoading={isLoading || pricesLoading}
      />
    </div>
  );
}
