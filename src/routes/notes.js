const express = require('express');
const Note = require('../models/Note');
const NoteShare = require('../models/NoteShare');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { isValidEmail, isValidObjectId, noteToResponse } = require('../utils');

const router = express.Router();

async function getNoteAccess(noteId, userId) {
  if (!isValidObjectId(noteId) || !isValidObjectId(userId)) {
    return { note: null, isOwner: false, canRead: false };
  }

  const note = await Note.findById(noteId);
  if (!note) return { note: null, isOwner: false, canRead: false };

  const isOwner = note.ownerId.toString() === userId;
  if (isOwner) return { note, isOwner: true, canRead: true };

  const share = await NoteShare.findOne({ noteId: note._id, userId });
  return { note, isOwner: false, canRead: Boolean(share) };
}

function validateNoteBody(title, content, res) {
  if (title === undefined || content === undefined) {
    res.status(400).json({ message: 'Title and content are required' });
    return false;
  }
  if (typeof title !== 'string' || typeof content !== 'string') {
    res.status(400).json({ message: 'Title and content must be strings' });
    return false;
  }
  if (!title.trim()) {
    res.status(400).json({ message: 'Title cannot be empty' });
    return false;
  }
  return true;
}

router.get('/notes', authMiddleware, async (req, res) => {
  const notes = await Note.find({ ownerId: req.userId })
    .sort({ isPinned: -1, reminderAt: 1, updatedAt: -1 })
    .exec();

  return res.status(200).json(notes.map(noteToResponse));
});

router.get('/notes/:id', authMiddleware, async (req, res) => {
  const { note, canRead } = await getNoteAccess(req.params.id, req.userId);
  if (!note || !canRead) {
    return res.status(404).json({ message: 'Note not found' });
  }
  return res.status(200).json(noteToResponse(note));
});

router.post('/notes', authMiddleware, async (req, res) => {
  const { title, content } = req.body || {};
  if (!validateNoteBody(title, content, res)) return;

  const note = await Note.create({
    ownerId: req.userId,
    title: title.trim(),
    content,
  });

  console.log(`   ↳ Note created: "${note.title}" (${note._id})`);
  return res.status(201).json(noteToResponse(note));
});

router.put('/notes/:id', authMiddleware, async (req, res) => {
  const { note, isOwner } = await getNoteAccess(req.params.id, req.userId);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  if (!isOwner) {
    return res.status(403).json({ message: 'Only the owner can update this note' });
  }

  const { title, content } = req.body || {};
  if (!validateNoteBody(title, content, res)) return;

  note.title = title.trim();
  note.content = content;
  await note.save();

  return res.status(200).json(noteToResponse(note));
});

router.delete('/notes/:id', authMiddleware, async (req, res) => {
  const { note, isOwner } = await getNoteAccess(req.params.id, req.userId);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  if (!isOwner) {
    return res.status(403).json({ message: 'Only the owner can delete this note' });
  }

  await NoteShare.deleteMany({ noteId: note._id });
  await Note.deleteOne({ _id: note._id });

  return res.status(204).send();
});

router.post('/notes/:id/share', authMiddleware, async (req, res) => {
  const { share_with_email } = req.body || {};

  if (!share_with_email || typeof share_with_email !== 'string') {
    res.locals.errorMessage = 'share_with_email is required';
    return res.status(400).json({ message: res.locals.errorMessage });
  }

  if (!isValidEmail(share_with_email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const { note, isOwner } = await getNoteAccess(req.params.id, req.userId);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  if (!isOwner) {
    return res.status(403).json({ message: 'Only the owner can share this note' });
  }

  const targetEmail = share_with_email.trim().toLowerCase();
  const targetUser = await User.findOne({ email: targetEmail });

  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (targetUser._id.toString() === req.userId) {
    return res.status(400).json({ message: 'Cannot share a note with yourself' });
  }

  try {
    await NoteShare.create({ noteId: note._id, userId: targetUser._id });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }

  console.log(`   ↳ Note shared: "${note.title}" → ${targetEmail}`);
  return res.status(200).json({ message: 'Note shared successfully' });
});

/** Custom feature: pin / unpin a note */
router.patch('/notes/:id/pin', authMiddleware, async (req, res) => {
  const { pinned } = req.body || {};

  if (typeof pinned !== 'boolean') {
    return res.status(400).json({ message: 'pinned must be a boolean' });
  }

  const { note, isOwner } = await getNoteAccess(req.params.id, req.userId);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  if (!isOwner) {
    return res.status(403).json({ message: 'Only the owner can pin this note' });
  }

  note.isPinned = pinned;
  await note.save();

  return res.status(200).json({
    ...noteToResponse(note),
    is_pinned: note.isPinned,
  });
});

/** Custom feature: set or clear a reminder */
router.patch('/notes/:id/reminder', authMiddleware, async (req, res) => {
  const { reminder_at } = req.body || {};

  if (reminder_at !== null && (reminder_at === undefined || typeof reminder_at !== 'string')) {
    res.locals.errorMessage = 'reminder_at must be an ISO date string or null';
    return res.status(400).json({ message: res.locals.errorMessage });
  }

  const { note, isOwner } = await getNoteAccess(req.params.id, req.userId);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  if (!isOwner) {
    return res.status(403).json({ message: 'Only the owner can set a reminder' });
  }

  if (reminder_at === null) {
    note.reminderAt = null;
  } else {
    const when = new Date(reminder_at);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ message: 'Invalid reminder_at date' });
    }
    note.reminderAt = when;
  }

  await note.save();
  console.log(
    `   ↳ Reminder ${note.reminderAt ? 'set' : 'cleared'}: "${note.title}"${
      note.reminderAt ? ` @ ${note.reminderAt.toISOString()}` : ''
    }`
  );

  return res.status(200).json(noteToResponse(note));
});

module.exports = router;
