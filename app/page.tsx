"use client";

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import AddAssetDialog from '../components/AddAssetDialog';
import AssetList from '../components/AssetList';
import { Asset } from '@prisma/client';

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/assets');
      const data = await response.json();
      
      if (response.ok) {
        setAssets(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch assets",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error" + error.message,
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Crypto Portfolio
          </h1>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Total Portfolio Value</h2>
            <p className="text-3xl font-bold text-green-400">$0.00</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-2">24h Change</h2>
            <p className="text-3xl font-bold text-green-400">+0.00%</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Total Assets</h2>
            <p className="text-3xl font-bold text-blue-400">{assets.length}</p>
          </Card>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center">
            <p className="text-gray-400">Loading assets...</p>
          </div>
        ) : (
          <AssetList assets={assets} onUpdate={fetchAssets} />
        )}
        
        <AddAssetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAssetAdded={fetchAssets}
        />
      </div>
    </main>
  );
}