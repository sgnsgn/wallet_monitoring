import { NextResponse } from 'next/server';
import { getLatestQuotes } from '@/lib/coinmarketcap';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all unique symbols from the database
    const assets = await prisma.asset.findMany({
      select: {
        symbol: true,
      },
      distinct: ['symbol'],
    });

    const symbols = assets.map(asset => asset.symbol.toUpperCase());

    if (symbols.length === 0) {
      return NextResponse.json({ data: {} });
    }

    const quotes = await getLatestQuotes(symbols);
    return NextResponse.json({ data: quotes });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current prices' },
      { status: 500 }
    );
  }
}