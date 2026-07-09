// prisma.js — Single shared Prisma Client instance for the whole app.
// Prisma 7 requires a driver adapter; we use @prisma/adapter-pg for PostgreSQL.
// The app runtime connects through DATABASE_URL (session pooler).

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// The adapter bridges Prisma's query interface and the native pg driver.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
