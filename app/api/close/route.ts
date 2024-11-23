import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, quantity, sell_price } = await request.json();

    // Vérifications
    if (!id || !quantity || !sell_price) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Récupérer l'actif concerné
    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const remainingQuantity = parseFloat(asset.quantity.toString()) - quantity;
    if (remainingQuantity < 0) {
      return NextResponse.json({ error: 'Insufficient quantity' }, { status: 400 });
    }

    // Calculer le P/L
    const entryPrice = parseFloat(asset.purchasePrice.toString());
    const PnL = (sell_price - entryPrice) * quantity;

    // Insérer une entrée dans `Trade`
    const trade = await prisma.trade.create({
      data: {
        asset_id: id,
        type: asset.type, // Reprendre le type de l'actif
        quantity,
        entry_price: entryPrice,
        exit_price: sell_price,
        entry_date: asset.purchaseDate,
        exit_date: new Date(),
        pl: PnL,
        status: remainingQuantity === 0 ? 'closed' : 'open',
        leverage: 1, // Par défaut, car pas encore défini pour l'actif
        target_price: null, // Par défaut
      },
    });

    // Mettre à jour l'Asset
    await prisma.asset.update({
      where: { id },
      data: {
        quantity: remainingQuantity,
        is_closed: remainingQuantity === 0, // Marquer comme fermé si plus de quantité restante
      },
    });

    return NextResponse.json({ message: 'Position closed successfully', trade });
  } catch (error) {
    console.error('Error closing position:', error);
    return NextResponse.json({ error: 'Failed to close position' }, { status: 500 });
  }
}
