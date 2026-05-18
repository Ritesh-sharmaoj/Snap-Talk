const img = (seed, width = 900, height = 1100) =>
  `https://res.cloudinary.com/demo/image/upload/w_${width},h_${height},c_fill,g_auto/sample.jpg?seed=${seed}`;

export const mockUser = {
  _id: 'demo-user',
  username: 'aarya',
  fullName: 'Aarya Mehta',
  avatar: img('avatar', 300, 300),
  bio: 'Designing tiny stories, big moods, and clean mobile screens.',
  website: 'snaptalk.app/aarya',
  followersCount: 12840,
  followingCount: 428,
  postsCount: 36,
  role: 'admin',
  profileSetupCompleted: true,
};

export const mockUsers = [
  mockUser,
  {
    _id: 'u2',
    username: 'neonframes',
    fullName: 'Kabir Rao',
    avatar: img('kabir', 300, 300),
    bio: 'Short videos and street edits.',
    followersCount: 8320,
  },
  {
    _id: 'u3',
    username: 'quietpixel',
    fullName: 'Mira Sen',
    avatar: img('mira', 300, 300),
    bio: 'Cafe corners, travel notes, soft color.',
    followersCount: 5420,
  },
  {
    _id: 'u4',
    username: 'gridwalk',
    fullName: 'Rohan Kapoor',
    avatar: img('rohan', 300, 300),
    bio: 'Architecture, food, people.',
    followersCount: 3290,
  },
];

export const mockStories = mockUsers.map((user, index) => ({
  _id: `story-${index}`,
  author: user,
  mediaUrl: img(`story-${index}`, 900, 1400),
  caption: ['Morning line test', 'City light is different today', 'A reel before the rain', 'New corner found'][index],
  createdAt: new Date(Date.now() - (index + 1) * 22 * 60 * 1000).toISOString(),
  viewers: mockUsers.slice(0, index + 1),
}));

export const mockPosts = [
  {
    _id: 'p1',
    author: mockUsers[1],
    mediaUrl: img('p1'),
    mediaType: 'image',
    caption: 'Late-evening frames from the station walk. #streetstory #snapflow',
    hashtags: ['streetstory', 'snapflow'],
    likesCount: 2384,
    commentCount: 128,
    sharesCount: 42,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    _id: 'p2',
    author: mockUsers[2],
    mediaUrl: img('p2'),
    mediaType: 'image',
    caption: 'Found a quiet table and turned the afternoon into a mood board. #cafedays',
    hashtags: ['cafedays'],
    likesCount: 1187,
    commentCount: 73,
    sharesCount: 19,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'p3',
    author: mockUsers[3],
    mediaUrl: img('p3'),
    mediaType: 'video',
    caption: 'Quick transition test with the new coral preset. #reelcraft',
    hashtags: ['reelcraft'],
    likesCount: 3290,
    commentCount: 211,
    sharesCount: 68,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockReels = [
  {
    _id: 'r1',
    author: mockUsers[1],
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/w_720,h_1280,c_fill/dog.mp4',
    thumbnailUrl: img('r1', 720, 1280),
    caption: 'Three cuts, one beat.',
    audioTitle: 'City pulse - Original audio',
    likesCount: 8800,
    commentCount: 302,
    sharesCount: 91,
  },
  {
    _id: 'r2',
    author: mockUsers[2],
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/w_720,h_1280,c_fill/dog.mp4',
    thumbnailUrl: img('r2', 720, 1280),
    caption: 'Soft focus day log.',
    audioTitle: 'Window light - Original audio',
    likesCount: 5400,
    commentCount: 190,
    sharesCount: 54,
  },
];

export const mockNotifications = [
  {
    _id: 'n1',
    type: 'like',
    actor: mockUsers[1],
    text: 'liked your latest post.',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    _id: 'n2',
    type: 'follow',
    actor: mockUsers[2],
    text: 'started following you.',
    read: false,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    _id: 'n3',
    type: 'comment',
    actor: mockUsers[3],
    text: 'commented: this color set is crisp.',
    read: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockChats = [
  {
    _id: 'chat-1',
    user: mockUsers[1],
    lastMessage: 'That transition came out clean.',
    unread: 2,
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
  {
    _id: 'chat-2',
    user: mockUsers[2],
    lastMessage: 'Sending the cover options now.',
    unread: 0,
    createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
  },
];

export const mockMessages = [
  {
    _id: 'm1',
    sender: mockUsers[1],
    text: 'That transition came out clean.',
    type: 'text',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    _id: 'm2',
    sender: mockUser,
    text: 'Send me the second version too.',
    type: 'text',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    seen: true,
  },
];

export const mockAdmin = {
  stats: {
    users: 12842,
    posts: 48210,
    reels: 15600,
    openReports: 18,
    blockedUsers: 42,
  },
  reports: [
    { _id: 'rep1', targetType: 'Post', reason: 'spam', status: 'open', reporter: mockUsers[2] },
    { _id: 'rep2', targetType: 'Reel', reason: 'scam', status: 'reviewing', reporter: mockUsers[3] },
  ],
};
