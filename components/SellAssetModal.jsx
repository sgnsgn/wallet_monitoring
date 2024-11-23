import React, { useState } from "react";

export default function SellAssetModal({ asset, onClose, onSellComplete }) {
  const [quantity, setQuantity] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);

  const handleSell = async () => {
    if (quantity <= 0 || sellPrice <= 0) {
      alert("Quantity and sell price must be positive numbers.");
      return;
    }

    try {
      const response = await fetch("/api/assets/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: asset.id,
          quantity,
          sell_price: sellPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to close position");
      }

      const data = await response.json();
      onSellComplete(); // Notifier le parent de mettre à jour la liste
      onClose(); // Fermer le modal
    } catch (error) {
      console.error("Error selling asset:", error);
      alert("Error closing position: " + error.message);
    }
  };

  return (
    <div className="modal">
      <h2>Sell Asset: {asset.name}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSell();
        }}
      >
        <label>Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))}
          min="0"
          max={asset.quantity}
          step="0.0001"
        />
        <label>Sell Price</label>
        <input
          type="number"
          value={sellPrice}
          onChange={(e) => setSellPrice(parseFloat(e.target.value))}
          min="0"
          step="0.01"
        />
        <button type="submit">Sell</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
