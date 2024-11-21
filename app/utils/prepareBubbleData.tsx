interface BubbleData {
  id: string;
  value: number;
  totalQuantity: number;
  totalPurchaseValue: number;
  label: string;
  fullname: string;
  percentage: string;
  percentChange24h: number;
  tradeType: string;
  pl: number; // P/L final en pourcentage
  plValue: number; // P/L final en dollars
}

export function prepareBubbleData(assets: Asset[], prices: { [key: string]: CryptoData }): BubbleData[] {
  const bubbleData = assets.reduce((acc, asset) => {
    const currentPrice =
      prices[asset.symbol.toUpperCase()]?.quote.USD.price || 0;

    const totalValue = currentPrice * parseFloat(asset.quantity.toString());
    const purchaseValue =
      parseFloat(asset.purchasePrice.toString()) *
      parseFloat(asset.quantity.toString());

    const normalizedName = asset.name.toLowerCase().trim();
    const normalizedSymbol = asset.symbol.toLowerCase().trim();

    const existing = acc.find(
      (b) =>
        b.label.toLowerCase().trim() === normalizedSymbol &&
        b.fullname.toLowerCase().trim() === normalizedName
    );

    if (existing) {
      // Ajouter les quantités et valeurs d'achat
      existing.totalQuantity += parseFloat(asset.quantity.toString());
      existing.totalPurchaseValue += purchaseValue;
      existing.value += totalValue;
    } else {
      acc.push({
        id: asset.id.toString(),
        value: totalValue, // Valeur totale actuelle
        totalQuantity: parseFloat(asset.quantity.toString()), // Quantité totale
        totalPurchaseValue: purchaseValue, // Valeur d'achat totale
        label: asset.symbol,
        fullname: asset.name,
        percentage: "0", // Pourcentage sera calculé plus tard
        percentChange24h:
          prices[asset.symbol.toUpperCase()]?.quote.USD.percent_change_24h || 0,
        tradeType: asset.trade_type,
      });
    }

    return acc;
  }, [] as BubbleData[]);

  // Calculer le total des valeurs pour les pourcentages
  const totalValue = bubbleData.reduce((sum, bubble) => sum + bubble.value, 0);

  // Étape 3 : Calculer le P/L final pour chaque bulle
  return bubbleData.map((bubble) => {
    const averagePurchasePrice = bubble.totalPurchaseValue / bubble.totalQuantity;

    // P/L en pourcentage
    const pl = ((bubble.value / bubble.totalQuantity - averagePurchasePrice) / averagePurchasePrice) * 100;

    // P/L en dollars
    const plValue = bubble.value - bubble.totalPurchaseValue;

    return {
      ...bubble,
      pl, // P/L final en pourcentage
      plValue, // P/L final en dollars
      percentage: ((bubble.value / totalValue) * 100).toFixed(2),
    };
  });
}
