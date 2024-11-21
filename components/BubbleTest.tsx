"use client";

import { useMemo } from "react";

export default function BubbleTest() {
  // Données statiques pour le test
  const testData = [
    { id: 1, name: "Bubble A", value: 50 },
    { id: 2, name: "Bubble B", value: 30 },
    { id: 3, name: "Bubble C", value: 20 },
    { id: 4, name: "Bubble D", value: 10 },
  ];

  // Calcul des proportions, rayons, et positions
  const bubbles = useMemo(() => {
    const totalValue = testData.reduce((sum, item) => sum + item.value, 0);

    let placedBubbles = [];
    testData.forEach((item, index) => {
      const proportion = item.value / totalValue;
      const area = proportion * 100 * 100; // Surface totale
      const radius = Math.sqrt(area / Math.PI);

      // Placement simple (centré puis écarté pour éviter chevauchement)
      const angle = (index / testData.length) * 2 * Math.PI; // Répartir en cercle
      const centerX = 50 + Math.cos(angle) * (radius + 10); // Position X
      const centerY = 50 + Math.sin(angle) * (radius + 10); // Position Y

      // Ajouter la bulle
      placedBubbles.push({ ...item, radius, centerX, centerY });
    });

    return placedBubbles;
  }, [testData]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <svg viewBox="0 0 100 100" className="w-[500px] h-[500px]">
        {/* Dessiner chaque bulle */}
        {bubbles.map((bubble) => (
          <circle
            key={bubble.id}
            cx={bubble.centerX}
            cy={bubble.centerY}
            r={bubble.radius}
            fill="rgba(30,144,255,0.7)"
            stroke="white"
            strokeWidth="0.5"
          >
            <title>{`${bubble.name} (${bubble.value}%)`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
