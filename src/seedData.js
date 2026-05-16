const User = require('./models/User');
const { hashPassword } = require('./utils/password');
const { generateAvatarUrl } = require('./utils/avatar');
const Note = require('./models/Note');
const NoteShare = require('./models/NoteShare');

const TEST_PASSWORD = 'password123';

const DEMO_USERS = [
  { email: 'alice@test.com', key: 'alice' },
  { email: 'bob@test.com', key: 'bob' },
  { email: 'carol@test.com', key: 'carol' },
];

const SAMPLE_NOTES = {
  alice: [
    { title: 'Grocery list', content: 'Milk, eggs, bread, coffee, bananas', isPinned: true },
    { title: 'Meeting notes', content: 'Standup at 10am. Discuss sprint goals and blockers.', isPinned: false },
    { title: 'Weekend plans', content: 'Hike on Saturday. Dinner with friends on Sunday.', isPinned: false },
    { title: 'Interview prep', content: 'Review REST APIs, JWT, MongoDB basics.', isPinned: true },
  ],
  bob: [
    { title: 'Project ideas', content: 'Notes API, habit tracker, recipe sharing app', isPinned: true },
    { title: 'Book recommendations', content: 'Atomic Habits, Clean Code, Designing Data-Intensive Applications', isPinned: false },
    { title: 'Gym routine', content: 'Mon/Wed/Fri — push pull legs split', isPinned: false },
  ],
  carol: [
    { title: 'Travel checklist', content: 'Passport, charger, tickets, sunscreen, adapters', isPinned: false },
    { title: 'Birthday gifts', content: 'Mom — scarf. Dad — wireless earbuds.', isPinned: true },
  ],
};

async function seedDatabase({ quiet = false, force = false } = {}) {
  const log = quiet ? () => {} : (...args) => console.log(...args);

  const emails = DEMO_USERS.map((u) => u.email);
  const existing = await User.countDocuments({ email: { $in: emails } });

  if (!force && existing === DEMO_USERS.length) {
    log('Dummy data already exists — skipping seed. Run: npm run seed:force');
    return { skipped: true, password: TEST_PASSWORD, users: DEMO_USERS };
  }

  log(force ? 'Re-seeding dummy data...' : 'Seeding dummy data...');

  await NoteShare.deleteMany({});
  await Note.deleteMany({});
  await User.deleteMany({ email: { $in: emails } });

  const passwordHash = await hashPassword(TEST_PASSWORD);
  const users = {};

  for (const { email, key } of DEMO_USERS) {
    users[key] = await User.create({ email, passwordHash, avatar: generateAvatarUrl(email) });
    log(`  User: ${email}`);
  }

  const notes = {};

  for (const [key, items] of Object.entries(SAMPLE_NOTES)) {
    notes[key] = [];
    for (const item of items) {
      const note = await Note.create({
        ownerId: users[key]._id,
        title: item.title,
        content: item.content,
        isPinned: item.isPinned,
      });
      notes[key].push(note);
      log(`  Note: "${item.title}" (${key})`);
    }
  }

  const reminderTime = new Date();
  reminderTime.setHours(reminderTime.getHours() + 2);
  notes.alice[1].reminderAt = reminderTime;
  await notes.alice[1].save();
  log('  Reminder: alice → Meeting notes');

  await NoteShare.create({ noteId: notes.alice[0]._id, userId: users.bob._id });
  log('  Share: alice → bob (Grocery list)');

  await NoteShare.create({ noteId: notes.bob[0]._id, userId: users.carol._id });
  log('  Share: bob → carol (Project ideas)');

  log('Dummy data ready. Password for all demo users:', TEST_PASSWORD);

  return { skipped: false, password: TEST_PASSWORD, users: DEMO_USERS };
}

module.exports = { seedDatabase, TEST_PASSWORD, DEMO_USERS };
