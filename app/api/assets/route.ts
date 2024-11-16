require('dotenv').config();
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$connect();
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed. Please ensure your database is properly configured.' 
    }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await prisma.$connect();
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
      },
    });
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Failed to create asset. Please ensure your database is properly configured.' 
    }, { status: 503 });
  }
}