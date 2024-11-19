import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// GET: Récupérer tous les trades
export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      include: {
        asset: true, // Inclure les informations de l'actif lié
      },
    });
    return NextResponse.json(trades);
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades." },
      { status: 500 }
    );
  }
}

// POST: Ajouter un nouveau trade
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newTrade = await prisma.trade.create({
      data: {
        asset_id: data.asset_id, // L'ID de l'actif associé
        type: data.type,
        leverage: data.leverage || null,
        target_price: data.target_price || null,
        quantity: data.quantity,
        entry_price: data.entry_price,
        exit_price: data.exit_price || null,
        entry_date: new Date(data.entry_date),
        exit_date: data.exit_date ? new Date(data.exit_date) : null,
        status: data.status || "open",
      },
    });

    return NextResponse.json(newTrade);
  } catch (error) {
    console.error("Error creating trade:", error);
    return NextResponse.json(
      { error: "Failed to create trade." },
      { status: 500 }
    );
  }
}
