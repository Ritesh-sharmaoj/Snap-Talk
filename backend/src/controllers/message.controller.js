const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const createNotification = require('../utils/createNotification');
const Message = require('../models/Message');
const User = require('../models/User');

const conversationIdFor = (a, b) => [String(a), String(b)].sort().join(':');

const populateMessage = (query) =>
  query.populate('sender', 'username fullName avatar online').populate('recipient', 'username fullName avatar online');

const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, text = '', type = 'text', mediaUrl = '' } = req.body;

  if (!recipientId) {
    throw new ApiError(422, 'recipientId is required.');
  }

  if (type === 'text' && !text.trim()) {
    throw new ApiError(422, 'Message text is required.');
  }

  if (type === 'image' && !mediaUrl) {
    throw new ApiError(422, 'mediaUrl is required for image messages.');
  }

  const recipient = await User.findById(recipientId);

  if (!recipient || recipient.isDeleted) {
    throw new ApiError(404, 'Recipient not found.');
  }

  const message = await Message.create({
    conversationId: conversationIdFor(req.user._id, recipient._id),
    sender: req.user._id,
    recipient: recipient._id,
    text,
    type,
    mediaUrl,
  });

  await message.populate('sender', 'username fullName avatar online');
  await message.populate('recipient', 'username fullName avatar online');

  await createNotification({
    recipient: recipient._id,
    actor: req.user._id,
    type: 'message',
    entityType: 'Message',
    entity: message._id,
    text: `${req.user.username} sent you a message.`,
    io: req.app.get('io'),
  });

  const io = req.app.get('io');
  io?.to(String(recipient._id)).emit('message:new', message);
  io?.to(String(req.user._id)).emit('message:sent', message);

  res.status(201).json({
    success: true,
    message: 'Message sent.',
    data: message,
  });
});

const getThread = asyncHandler(async (req, res) => {
  const otherUser = await User.findById(req.params.userId);

  if (!otherUser) {
    throw new ApiError(404, 'User not found.');
  }

  const messages = await populateMessage(
    Message.find({ conversationId: conversationIdFor(req.user._id, otherUser._id) }).sort({ createdAt: 1 })
  );

  res.json({ success: true, data: messages });
});

const getConversations = asyncHandler(async (req, res) => {
  const messages = await populateMessage(
    Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    }).sort({ createdAt: -1 })
  );

  const byConversation = new Map();

  messages.forEach((message) => {
    if (!byConversation.has(message.conversationId)) {
      byConversation.set(message.conversationId, message);
    }
  });

  res.json({ success: true, data: [...byConversation.values()] });
});

const markSeen = asyncHandler(async (req, res) => {
  const conversationId = conversationIdFor(req.user._id, req.params.userId);

  await Message.updateMany(
    { conversationId, recipient: req.user._id, seen: false },
    { seen: true, seenAt: new Date() }
  );

  req.app.get('io')?.to(req.params.userId).emit('message:seen', {
    conversationId,
    seenBy: req.user._id,
  });

  res.json({ success: true, message: 'Messages marked as seen.' });
});

module.exports = {
  sendMessage,
  getThread,
  getConversations,
  markSeen,
};
