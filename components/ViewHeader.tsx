"use client";

import { formatDistance } from "date-fns";
import { PlusCircle, RefreshCw, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewHeaderProps {
  title: string;
  lastUpdated?: Date;
  onRefresh: () => void;
  onAddAssetClick: () => void;
  onToggleView: () => void; // Nouvelle propriété pour le toggle
  isRefreshing: boolean;
  isBubbleView: boolean; // Nouvelle propriété pour connaître l'état de la vue
}

export default function ViewHeader({
  title,
  lastUpdated,
  onRefresh,
  onAddAssetClick,
  onToggleView,
  isRefreshing,
  isBubbleView,
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
          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-blue-400 hover:text-white transition-all duration-300"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Updating..." : "Update Prices"}
        </Button>
        <Button
          onClick={onAddAssetClick}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-blue-400 hover:text-white transition-all duration-300"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
        <Button
          onClick={onToggleView}
          className={`bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-300 ${
            isBubbleView ? "text-blue-400" : "text-blue-400"
          }`}
        >
          {isBubbleView ? (
            <>
              <List className="mr-2 h-4 w-4" />
              List View
            </>
          ) : (
            <>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Bubble View
            </>
          )}
        </Button>

      </div>
    </div>
  );
}
