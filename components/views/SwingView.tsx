"use client";

import { useState, useEffect } from "react";
import SwingOverview from "@/components/Swing/SwingOverview";
import SwingList from "@/components/Swing/SwingList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog"; // Import du composant générique
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export default function SwingView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Gestion de AddAssetDialog
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
        // Filtrer les actifs par trade_type pour afficher uniquement les Swings
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

  return (
    <div>
      {/* Vue header */}
      <ViewHeader
        title="Swing Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)} // Ouvre le AddAssetDialog
        isRefreshing={pricesLoading}
      />

      {/* Overview */}
      <SwingOverview assets={assets} prices={prices} isLoading={isLoading} />

      {/* Liste des Swings */}
      <SwingList
        assets={assets}
        prices={prices}
        isLoading={isLoading || pricesLoading}
      />

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Ferme le dialog après soumission
        onAssetAdded={fetchAssets} // Recharge les données après l'ajout
        defaultTradeType="swing" // Spécifie le type d'actif par défaut
      />
    </div>
  );
}
