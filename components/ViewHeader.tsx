"use client";

import { formatDistance } from "date-fns";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewHeaderProps {
  title: string;
  lastUpdated?: Date;
  onRefresh: () => void;
  onAddAssetClick: () => void;
  isRefreshing: boolean;
}

export default function ViewHeader({
  title,
  lastUpdated,
  onRefresh,
  onAddAssetClick,
  isRefreshing,
}: ViewHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {title}
        </h1>
        {lastUpdated && (
          <p className="text-sm text-gray-400 mt-1">
            Prices last updated:{" "}
            {formatDistance(lastUpdated, new Date(), { addSuffix: true })}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Updating..." : "Update Prices"}
        </Button>
        <Button
          onClick={onAddAssetClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>
    </div>
  );
}
