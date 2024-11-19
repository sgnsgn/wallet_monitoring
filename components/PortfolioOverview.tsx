import { formatDistance } from "date-fns";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioOverviewProps {
  assets: any[];
  prices: { [key: string]: any };
  isLoading: boolean;
  lastUpdated: Date | null;
}

export default function PortfolioOverview({
  assets,
  prices,
  isLoading,
  lastUpdated,
}: PortfolioOverviewProps) {
  const calculateTotalValue = () =>
    assets.reduce((total, asset) => {
      const currentPrice =
        prices[asset.symbol.toUpperCase()]?.quote.USD.price ||
        parseFloat(asset.purchasePrice.toString());
      return total + currentPrice * parseFloat(asset.quantity.toString());
    }, 0);

  const calculateGlobalPL = () => {
    const totalInvested = assets.reduce((total, asset) => {
      return (
        total +
        parseFloat(asset.purchasePrice.toString()) *
          parseFloat(asset.quantity.toString())
      );
    }, 0);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h2 className="text-xl font-semibold mb-2 text-gray-400">Total Value</h2>
        {isLoading ? (
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
        {isLoading ? (
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
        {isLoading ? (
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
        <h2 className="text-xl font-semibold mb-2 text-gray-400">Total Assets</h2>
        <p className="text-3xl font-bold text-blue-400">{assets.length}</p>
      </Card>
    </div>
  );
}
