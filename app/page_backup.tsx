"use client";

import { useEffect, useState } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AddAssetDialog from "@/components/AddAssetDialog";
import AssetList from "@/components/AssetList";
import { Asset } from "@prisma/client";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import StackingList from "@/components/stacking/StackingList";
import StablecoinList from "@/components/stablecoins/StablecoinList";
import AirdropList from "@/components/airdrop/AirdropList";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { prices, isLoading: pricesLoading, fetchPrices, lastUpdated } =
    useCryptoPrices();
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
        // Fetch new prices when assets are loaded
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

  const handleAssetAdded = async () => {
    await fetchAssets();
    await fetchPrices();
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
        parseFloat(asset.purchasePrice.toString()) *
          parseFloat(asset.quantity.toString())
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Crypto Portfolio
            </h1>
            {lastUpdated && (
              <p className="text-sm text-gray-400 mt-1">
                Prices last updated:{" "}
                {formatDistance(lastUpdated, new Date(), { addSuffix: true })}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            {/* Refresh Button */}
            <Button
              onClick={fetchPrices}
              disabled={pricesLoading}
              variant="outline"
              className="bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  pricesLoading ? "animate-spin" : ""
                }`}
              />
              {pricesLoading ? "Updating..." : "Update Prices"}
            </Button>
            {/* Add Asset Button */}
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-gray-400">
              Total Portfolio Value
            </h2>
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
            <h2 className="text-xl font-semibold mb-2 text-gray-400">
              Global P/L
            </h2>
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
            <h2 className="text-xl font-semibold mb-2 text-gray-400">
              24h Change
            </h2>
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
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-2 text-gray-400">
              Total Assets
            </h2>
            <p className="text-3xl font-bold text-blue-400">{assets.length}</p>
          </Card>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center">
            <p className="text-gray-400">Loading assets...</p>
          </div>
        ) : (
          <AssetList
            assets={assets}
            prices={prices}
            isLoading={pricesLoading}
            onUpdate={fetchAssets}
          />
        )}

        <AddAssetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAssetAdded={handleAssetAdded}
        />
        <StackingList assets={assets} prices={prices} isLoading={isLoading} onUpdate={fetchAssets}/>
        <StablecoinList assets={assets} prices={prices} isLoading={isLoading}/>
        <AirdropList assets={assets} prices={prices} isLoading={isLoading} />
      </div>
    </main>
  );
}
