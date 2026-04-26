require("dotenv").config();

const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log("Connecting to database...");
    console.log(process.env.DATABASE_URL);
    console.log(process.env.DIRECT_URL);
    const users = await prisma.user.findMany();

    console.log("✅ Prisma query succeeded");
    console.log("Users:", users);
  } catch (err) {
    console.error("❌ Prisma query failed");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
