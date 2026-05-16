#!/usr/bin/env node
/**
 * Run before deploying: node scripts/check-render-ready.js
 * Uses .env in project root (same values you paste into Render → Environment).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

const required = ['JWT_SECRET', 'MONGODB_URI', 'ABOUT_NAME', 'ABOUT_EMAIL'];
let ok = true;

console.log('\n--- Render deploy checklist ---\n');

for (const key of required) {
  const set = Boolean(process.env[key]?.trim());
  console.log(set ? `  OK  ${key}` : `  MISSING  ${key}`);
  if (!set) ok = false;
}

if (!ok) {
  console.log('\nFix .env locally, then copy the same keys into Render → Environment.\n');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI.trim(), { serverSelectionTimeoutMS: 15000 });
    await mongoose.disconnect();
    console.log('\n  OK  MongoDB connection');
    console.log('\nNext steps:');
    console.log('  1. Atlas → Network Access → Add 0.0.0.0/0 (Allow from anywhere)');
    console.log('  2. Render → EpifiShare-1 → Environment → paste all vars from .env');
    console.log('  3. Set SEED_ON_START=false, COOKIE_SECURE=true, NODE_ENV=production');
    console.log('  4. Save → wait for redeploy → open /health\n');
  } catch (e) {
    console.error('\n  FAIL  MongoDB:', e.message);
    console.error('\n  Atlas → Network Access → allow 0.0.0.0/0\n');
    process.exit(1);
  }
})();
