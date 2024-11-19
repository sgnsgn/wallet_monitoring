"use client";

import { useState } from "react";
import { Globe, Gift, DollarSign, Lock, Briefcase, Wallet, Activity } from "lucide-react";
import GlobalView from "@/components/views/GlobalView";
import SwingView from "@/components/views/SwingView";
import AirdropView from "@/components/views/AirdropView";
import StackingView from "@/components/views/StackingView";
import StablecoinView from "@/components/views/StablecoinView";
import WalletView from "@/components/views/WalletView";
import TradeView from "@/components/views/TradeView";

export default function MainPage() {
  const [activeView, setActiveView] = useState("global");

  const renderActiveView = () => {
    switch (activeView) {
      case "global":
        return <GlobalView />;
      case "swing":
        return <SwingView />;
      case "airdrop":
        return <AirdropView />;
      case "stacking":
        return <StackingView />;
      case "stablecoin":
        return <StablecoinView />;
      case "wallet":
        return <WalletView />;
      case "trade":
        return <TradeView />;
      default:
        return <GlobalView />;
    }
  };

  const navItems = [
    { label: "Global", icon: Globe, view: "global" },
    { label: "Swing", icon: Briefcase, view: "swing" },
    { label: "Airdrop", icon: Gift, view: "airdrop" },
    { label: "Stacking", icon: Lock, view: "stacking" },
    { label: "Stablecoins", icon: DollarSign, view: "stablecoin" },
    { label: "Wallet", icon: Wallet, view: "wallet" },
    { label: "Trade", icon: Activity, view: "trade" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Barre de navigation */}
        <nav className="flex items-center justify-center gap-2 py-8">
          {navItems.map(({ label, icon: Icon, view }) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex flex-col items-center px-10 py-2 rounded-lg transition-all ${
                activeView === view
                  ? "text-purple-400 bg-blue-600 bg-opacity-25"
                  : "text-blue-400 hover:text-white"
              }`}
            >
              <Icon className="w-10 h-10 mb-1" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>

        {/* Zone principale */}
        <div className="py-8">{renderActiveView()}</div>
      </div>
    </main>
  );
}
