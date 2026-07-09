// seed-admin.js — Creates (or promotes) the first admin from .env values.
// Safe to run multiple times: if the admin already exists, it is left as-is.
// Never hardcode credentials — they come from ADMIN_EMAIL / ADMIN_PASSWORD.

require('dotenv/config');
const bcrypt = require('bcrypt');
const prisma = require('../src/config/prisma');

const SALT_ROUNDS = 10;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // If the account exists but isn't admin yet, promote it.
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      });
      console.log(`✅ Promoted existing user to admin: ${email}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${email}`);
    }
    return;
  }

  // Create a fresh admin account.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'System Admin',
      role: 'admin',
    },
  });

  console.log(`✅ Created first admin: ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
