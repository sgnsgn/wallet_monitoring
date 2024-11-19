"use client";

import { useState, useEffect } from "react";
import WalletOverview from "@/components/Wallet/WalletOverview";
import WalletList from "@/components/Wallet/WalletList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog"; // Import du composant générique
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";

export default function WalletView() {
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
        // Filtrer les actifs par trade_type pour afficher uniquement les Wallets
        const filteredAssets = data.filter(
          (asset: Asset) => asset.trade_type === "Wallet"
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
        title="Wallet Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)} // Ouvre le AddAssetDialog
        isRefreshing={pricesLoading}
      />

      {/* Overview */}
      <WalletOverview assets={assets} prices={prices} isLoading={isLoading} />

      {/* Liste des Wallets */}
      <WalletList
        assets={assets}
        prices={prices}
        isLoading={isLoading || pricesLoading}
      />

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Ferme le dialog après soumission
        onAssetAdded={fetchAssets} // Recharge les données après l'ajout
        // defaultTradeType="Wallet" // Spécifie le type d'actif par défaut
      />
    </div>
  );
}
