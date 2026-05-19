const Notification = require('../models/Notification');

const createNotification = async ({ recipient, actor, type, entityType, entity, text, io }) => {
  if (!recipient || String(recipient) === String(actor)) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    entityType,
    entity,
    text,
  });

  if (io) {
    const populated = await notification.populate('actor', 'username fullName avatar');
    io.to(String(recipient)).emit('notification:new', populated);
  }

  return notification;
};

module.exports = createNotification;
