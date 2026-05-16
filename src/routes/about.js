const express = require('express');

const router = express.Router();

router.get('/about', (_req, res) => {
  res.status(200).json({
    name: process.env.ABOUT_NAME || 'Your Name',
    email: process.env.ABOUT_EMAIL || 'your.email@example.com',
    'my features': {
      'Pinned notes': `PATCH /notes/{id}/pin with body { "pinned": true|false } lets owners pin important notes. GET /notes returns pinned notes first so they stay visible at the top — similar to Google Keep.`,
      Reminders: `PATCH /notes/{id}/reminder with body { "reminder_at": "ISO-datetime" } or { "reminder_at": null } to schedule or clear a reminder. Notes with reminders show when they are due — useful for bills, meetings, and follow-ups.`,
    },
  });
});

module.exports = router;
