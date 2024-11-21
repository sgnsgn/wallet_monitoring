"use client";

import { useState, useEffect } from "react";
import StablecoinOverview from "@/components/Stablecoin/StablecoinOverview";
import StablecoinList from "@/components/Stablecoin/StablecoinList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog"; 
import AssetBubbles from "@/components/AssetBubbles"; // Assurez-vous que ce composant existe
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export default function StablecoinView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Gestion de AddAssetDialog
  const [isBubbleView, setIsBubbleView] = useState(false); // Toggle pour la vue alternative
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
        // Filtrer les actifs par trade_type pour afficher uniquement les Stablecoins
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

  return (
    <div>
      {/* Vue header */}
      <ViewHeader
  title="Stablecoin Portfolio"
  lastUpdated={lastUpdated}
  onRefresh={fetchPrices}
  onAddAssetClick={() => setIsDialogOpen(true)}
  onToggleView={() => setIsBubbleView(!isBubbleView)} // Toggle
  isBubbleView={isBubbleView} // Passer l'état actuel
  isRefreshing={pricesLoading}
/>

      {/* Overview */}
      <StablecoinOverview assets={assets} prices={prices} isLoading={isLoading} />

      {/* Vue conditionnelle */}
      {isBubbleView ? (
        <AssetBubbles assets={assets} prices={prices} /> // Vue alternative sous forme de bulles
      ) : (
        <StablecoinList assets={assets} prices={prices} isLoading={isLoading || pricesLoading} />
      )}

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Ferme le dialog après soumission
        onAssetAdded={fetchAssets} // Recharge les données après l'ajout
        defaultTradeType="stablecoin" // Spécifie le type d'actif par défaut
      />
    </div>
  );
}
