const Notification = require('../models/Notification');

const createNotification = async ({ recipient, actor, type, entityType, entity, text }) => {
  if (!recipient || String(recipient) === String(actor)) {
    return null;
  }

  return Notification.create({
    recipient,
    actor,
    type,
    entityType,
    entity,
    text,
  });
};

module.exports = createNotification;
