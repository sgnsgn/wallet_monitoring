import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database connection failed. Please ensure your database is properly configured.' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const asset = await prisma.asset.create({
      data: {
        name: data.name,
        symbol: data.symbol,
        blockchain: data.blockchain,
        wallet: data.wallet,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: new Date(data.purchaseDate),
        trade_type: data.trade_type || "swing", // Valeur par défaut
        origin: data.origin || "bought", // Valeur par défaut
        narrative: data.narrative || "unknown", // Valeur par défaut
        classification: data.classification || "unknown", // Valeur par défaut
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create asset. Check input data.' },
      { status: 503 }
    );
  }
}
