/* global use, db */

// Snap Talk backend saves users in the local "snap-talk" database.
// Run this playground after connecting MongoDB VS Code to mongodb://127.0.0.1:27017.
use('snap-talk');

db.getCollection('users')
  .find(
    {},
    {
      projection: {
        password: 0,
        refreshTokens: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0,
      },
    }
  )
  .sort({ createdAt: -1 })
  .limit(20)
  .toArray();
