"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import AssetList from "@/components/AssetList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog";
import Overview from "@/components/Overview";
import BubblePacking from "@/components/BubblePacking";
import { prepareBubbleData } from "@/app/utils/prepareBubbleData";


export default function GlobalView({ setActiveView }: { setActiveView: (view: string) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Pour gérer AddAssetDialog
  const [isLoading, setIsLoading] = useState(true);
  const [isBubbleView, setIsBubbleView] = useState(false);
  const { prices, isLoading: pricesLoading, fetchPrices, lastUpdated } = useCryptoPrices();
  const { toast } = useToast();

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
        fetchPrices();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch assets",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enhancedBubbleData = prepareBubbleData(assets, prices);

  return (
    <div>
       <ViewHeader
        title="Global Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)}
        onToggleView={() => setIsBubbleView(!isBubbleView)}
        isRefreshing={pricesLoading}
        isBubbleView={isBubbleView}/>

      {/* Vue synthétique */}
      <Overview
        assets={assets}
        prices={prices}
        isLoading={isLoading}
        viewType="global" // Spécifie la configuration à utiliser
      />


             
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
          "currentPrice",
          "currentValue",
          "plDollar",
          "plPercent",
          "change1h",
          "change24h",
          "change7d",
          "link",
        ]}
        onNavigate={setActiveView} // Réintégration de setActiveView pour navigation
      />
      )}
      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Gère l'ouverture/fermeture
        onAssetAdded={fetchAssets} // Actualise les données après ajout
      />
    </div>
  );
}
