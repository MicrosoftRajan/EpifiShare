const { TEST_PASSWORD, DEMO_USERS } = require('../seedData');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const icon = status >= 500 ? '✖' : status >= 400 ? '⚠' : '✔';
    const line = `${icon} ${req.method} ${req.originalUrl} → ${status} (${ms}ms)`;
    console.log(line);

    if (status >= 400 && res.locals.errorMessage) {
      console.log(`   ↳ ${res.locals.errorMessage}`);
    }
  });

  next();
}

function printStartupBanner(port) {
  const base = `http://localhost:${port}`;

  console.log('\n========================================');
  console.log('  Epifi Share API — running');
  console.log('========================================');
  console.log(`  URL:      ${base}`);
  console.log(`  Health:   ${base}/health`);
  console.log(`  About:    ${base}/about`);
  console.log(`  OpenAPI:  ${base}/openapi.json`);
  console.log('----------------------------------------');
  console.log('  Routes:');
  console.log('    POST   /register');
  console.log('    POST   /login');
  console.log('    POST   /logout');
  console.log('    GET    /notes          (auth)');
  console.log('    POST   /notes          (auth)');
  console.log('    GET    /notes/:id      (auth)');
  console.log('    PUT    /notes/:id      (auth)');
  console.log('    DELETE /notes/:id      (auth)');
  console.log('    POST   /notes/:id/share (auth)');
  console.log('    PATCH  /notes/:id/pin   (auth)');
  console.log('    PATCH  /notes/:id/reminder (auth)');
  console.log('----------------------------------------');
  console.log('  Demo users (password hashed in DB):');
  DEMO_USERS.forEach(({ email }) => {
    console.log(`    ${email} / ${TEST_PASSWORD}`);
  });
  console.log('----------------------------------------');
  console.log('  Auth: Bearer token OR access_token cookie after login');
  console.log('  Logs: every request prints below');
  console.log('========================================\n');
}

module.exports = { requestLogger, printStartupBanner };
