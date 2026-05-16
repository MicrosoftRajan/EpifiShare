const express = require('express');

const router = express.Router();

router.get('/about', (_req, res) => {
  res.status(200).json({
    name: process.env.ABOUT_NAME || 'Your Name',
    email: process.env.ABOUT_EMAIL || 'your.email@example.com',
    'my features': {
      'Pinned notes': `PATCH /notes/{id}/pin with body { "pinned": true|false } lets owners pin important notes. GET /notes returns pinned notes first so they stay visible at the top — similar to Google Keep. I chose this because power users often need a few notes always on top without searching.`,
    },
  });
});

module.exports = router;
