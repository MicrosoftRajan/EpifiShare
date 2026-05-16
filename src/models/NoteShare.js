const mongoose = require('mongoose');

const noteShareSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

noteShareSchema.index({ noteId: 1, userId: 1 }, { unique: true });
noteShareSchema.index({ userId: 1 });

module.exports = mongoose.model('NoteShare', noteShareSchema);
