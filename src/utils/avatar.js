function generateAvatarUrl(email) {
  const seed = encodeURIComponent(email.trim().toLowerCase());
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
}

module.exports = { generateAvatarUrl };
