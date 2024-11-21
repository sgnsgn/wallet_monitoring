"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import AssetList from "@/components/GlobalAssetList";
import ViewHeader from "@/components/ViewHeader";
import AddAssetDialog from "@/components/AddAssetDialog";
import BubbleTest from "../BubbleTest";


export default function GlobalView({ setActiveView }: { setActiveView: (view: string) => void }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Pour gérer AddAssetDialog
  const [isLoading, setIsLoading] = useState(true);
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

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price ||
        parseFloat(asset.purchasePrice.toString());
      return total + currentPrice * parseFloat(asset.quantity.toString());
    }, 0);
  };

  const calculateTotalInvested = () => {
    return assets.reduce((total, asset) => {
      return (
        total +
        parseFloat(asset.purchasePrice.toString()) * parseFloat(asset.quantity.toString())
      );
    }, 0);
  };

  const calculateGlobalPL = () => {
    const totalInvested = calculateTotalInvested();
    const totalValue = calculateTotalValue();
    return totalValue - totalInvested;
  };

  const calculate24hChange = () => {
    let totalChange = 0;
    let totalValue = 0;

    assets.forEach((asset) => {
      const price = prices[asset.symbol.toUpperCase()]?.quote.USD;
      if (price) {
        const value = parseFloat(asset.quantity.toString()) * price.price;
        totalValue += value;
        totalChange += (value * price.percent_change_24h) / 100;
      }
    });

    return totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
  };

  return (
    <div>
      {/* Utilisation du composant ViewHeader */}
      <ViewHeader
        title="Global Portfolio"
        lastUpdated={lastUpdated}
        onRefresh={fetchPrices}
        onAddAssetClick={() => setIsDialogOpen(true)} // Ouvrir AddAssetDialog
        isRefreshing={pricesLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-400">Total Assets</h2>
          <p className="text-3xl font-bold text-blue-400">{assets.length}</p>
        </Card>
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-400">Total Portfolio Value</h2>
          {pricesLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-3xl font-bold text-green-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(calculateTotalValue())}
            </p>
          )}
        </Card>
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-400">Global P/L</h2>
          {pricesLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p
              className={`text-3xl font-bold ${
                calculateGlobalPL() >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(calculateGlobalPL())}
            </p>
          )}
        </Card>
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-400">24h Change</h2>
          {pricesLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p
              className={`text-3xl font-bold ${
                calculate24hChange() >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {calculate24hChange().toFixed(2)}%
            </p>
          )}
        </Card>
      </div>

      {/* Liste des actifs */}
      <AssetList
        assets={assets}
        prices={prices}
        isLoading={isLoading}
        setActiveView={setActiveView}
        onUpdate={fetchAssets} // Mise à jour après ajout
      />
      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen} // Gère l'ouverture/fermeture
        onAssetAdded={fetchAssets} // Actualise les données après ajout
      />
      <BubbleTest />
    </div>
  );
}
