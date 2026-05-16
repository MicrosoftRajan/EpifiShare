const REQUIRED = ['JWT_SECRET', 'MONGODB_URI'];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length === 0) return;

  console.error('\n[startup] Missing required environment variables:');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('\nRender: Dashboard → your service → Environment → add each variable.');
  console.error('Local: copy .env.example to .env and fill in values.\n');
  process.exit(1);
}

module.exports = { validateEnv };
