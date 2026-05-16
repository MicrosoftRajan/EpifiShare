const mongoose = require('mongoose');

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function noteToResponse(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    is_pinned: Boolean(note.isPinned),
    created_at: note.createdAt.toISOString(),
    updated_at: note.updatedAt.toISOString(),
  };
}

module.exports = { isValidEmail, isValidObjectId, noteToResponse };
