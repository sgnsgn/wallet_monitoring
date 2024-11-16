require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const assets = await prisma.asset.findMany(); // Remplace "assets" par le nom exact de ton modèle
    console.log("Données récupérées :", assets);
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
