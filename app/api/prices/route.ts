import { NextResponse } from 'next/server';
import { getLatestQuotes } from '@/lib/coinmarketcap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Récupère tous les symboles uniques de la table Asset
    const assets = await prisma.asset.findMany({
      select: {
        symbol: true,
      },
      distinct: ['symbol'], // Symbols uniques
    });

    const symbols = assets.map(asset => asset.symbol.toUpperCase());

    if (symbols.length === 0) {
      console.warn('No symbols found in database.');
      return NextResponse.json({ data: {} });
    }

    const quotes = await getLatestQuotes(symbols);
    return NextResponse.json({ data: quotes });
  } catch (error) {
    console.error('Price fetch error:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch current prices' },
      { status: 500 }
    );
  }
}
