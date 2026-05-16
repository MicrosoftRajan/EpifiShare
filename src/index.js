require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const aboutRoutes = require('./routes/about');
const openApiSpec = require('./openapi');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const { TEST_PASSWORD, DEMO_USERS } = require('./seedData');
const { requestLogger, printStartupBanner } = require('./utils/logger');

app.use(requestLogger);

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Epifi Share API is running',
    docs: '/openapi.json',
    about: '/about',
    health: '/health',
    demo_accounts: DEMO_USERS.map((u) => ({
      email: u.email,
      password: TEST_PASSWORD,
    })),
    endpoints: [
      'POST /register',
      'POST /login',
      'POST /logout',
      'GET /notes',
      'POST /notes',
      'GET /notes/:id',
      'PUT /notes/:id',
      'DELETE /notes/:id',
      'POST /notes/:id/share',
      'PATCH /notes/:id/pin',
    ],
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/openapi.json', (_req, res) => {
  res.status(200).json(openApiSpec);
});

app.use(aboutRoutes);
app.use(authRoutes);
app.use(notesRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    res.locals.errorMessage = 'Invalid JSON body';
    return res.status(400).json({
      message: 'Invalid JSON body. Send only note fields in Body, and put the token in Authorization (Bearer Token).',
      example: { title: 'My note', content: 'Note body' },
    });
  }
  console.error('✖ Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  if (process.env.SEED_ON_START === 'true') {
    const { seedDatabase } = require('./seedData');
    await seedDatabase({ quiet: false });
  }

  const server = app.listen(PORT, () => {
    printStartupBanner(PORT);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process:`);
      console.error(`  lsof -ti:${PORT} | xargs kill -9`);
      process.exit(1);
    }
    throw err;
  });
}

start();
