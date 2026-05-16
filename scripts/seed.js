require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../src/db');
const { seedDatabase, TEST_PASSWORD, DEMO_USERS } = require('../src/seedData');

async function run() {
  await connectDB();
  const force = process.argv.includes('--force');
  await seedDatabase({ quiet: false, force });

  console.log('\nDemo logins:');
  DEMO_USERS.forEach(({ email }) => console.log(`  ${email} / ${TEST_PASSWORD}`));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
