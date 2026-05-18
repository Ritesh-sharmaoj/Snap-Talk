# Snap Talk API Documentation

Base URL:

```text
http://localhost:5000/api
```

Authenticated routes require:

```http
Authorization: Bearer <jwt_token>
```

Common response shape:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

## Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | API status check |

## Auth

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Create user with username, fullName, email or mobile, password |
| POST | `/auth/login` | No | Login with email, mobile, or username |
| POST | `/auth/forgot-password` | No | Generate password reset token |
| POST | `/auth/reset-password` | No | Reset password with token |
| GET | `/auth/me` | Yes | Get current user |
| PATCH | `/auth/setup-profile` | Yes | Complete profile setup |
| PATCH | `/auth/change-password` | Yes | Change password |

Signup body:

```json
{
  "username": "aarya",
  "fullName": "Aarya Mehta",
  "email": "aarya@example.com",
  "mobile": "",
  "password": "secret123"
}
```

Login body:

```json
{
  "identifier": "aarya@example.com",
  "password": "secret123"
}
```

## Users

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/users/search?q=aarya` | Yes | Search users |
| GET | `/users/suggested` | Yes | Suggested users |
| GET | `/users/:idOrUsername` | Yes | User profile |
| PATCH | `/users/me` | Yes | Edit current profile |
| DELETE | `/users/me` | Yes | Soft delete current account |
| GET | `/users/:idOrUsername/posts` | Yes | User post grid |
| GET | `/users/:idOrUsername/followers` | Yes | Followers list |
| GET | `/users/:idOrUsername/following` | Yes | Following list |

## Follow

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| POST | `/follow/:userId` | Yes | Follow user |
| DELETE | `/follow/:userId` | Yes | Unfollow user |

## Posts

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/posts/feed` | Yes | Posts from current user and followed users |
| GET | `/posts/explore` | Yes | Explore/trending posts |
| GET | `/posts/hashtag/:tag` | Yes | Posts by hashtag |
| POST | `/posts` | Yes | Create post |
| GET | `/posts/:postId` | Yes | Get post |
| POST | `/posts/:postId/save` | Yes | Save/unsave post |
| POST | `/posts/:postId/share` | Yes | Track share count |
| DELETE | `/posts/:postId` | Yes | Delete own post or admin delete |

Create post body:

```json
{
  "mediaUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "mediaType": "image",
  "caption": "A new day on Snap Talk #fresh",
  "hashtags": ["fresh"]
}
```

## Stories

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/stories` | Yes | Active stories from self and followed users |
| POST | `/stories` | Yes | Create 24-hour story |
| GET | `/stories/:storyId` | Yes | View story and record viewer |
| GET | `/stories/:storyId/viewers` | Yes | Story owner can view viewers |
| DELETE | `/stories/:storyId` | Yes | Delete own story or admin delete |

## Reels

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/reels` | Yes | Vertical short-video feed |
| POST | `/reels` | Yes | Create reel |
| GET | `/reels/:reelId` | Yes | Get reel |
| POST | `/reels/:reelId/share` | Yes | Track reel share |
| DELETE | `/reels/:reelId` | Yes | Delete own reel or admin delete |

Create reel body:

```json
{
  "videoUrl": "https://res.cloudinary.com/demo/video/upload/dog.mp4",
  "thumbnailUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "caption": "Quick cut",
  "audioTitle": "Original audio"
}
```

## Comments

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/comments/:targetType/:targetId` | Yes | List comments for `Post` or `Reel` |
| POST | `/comments/:targetType/:targetId` | Yes | Add comment |
| DELETE | `/comments/:commentId` | Yes | Delete own comment or admin delete |

Add comment body:

```json
{
  "text": "This looks clean."
}
```

## Likes

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| POST | `/likes/posts/:postId` | Yes | Like/unlike post |
| POST | `/likes/reels/:reelId` | Yes | Like/unlike reel |
| POST | `/likes/comments/:commentId` | Yes | Like/unlike comment |

## Messages

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/messages/conversations` | Yes | Chat list with latest messages |
| GET | `/messages/:userId` | Yes | One-to-one chat thread |
| POST | `/messages` | Yes | Send text or image message |
| PATCH | `/messages/:userId/seen` | Yes | Mark a conversation seen |

Send text message body:

```json
{
  "recipientId": "USER_ID",
  "type": "text",
  "text": "Hey, this post is great."
}
```

Send image message body:

```json
{
  "recipientId": "USER_ID",
  "type": "image",
  "mediaUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg"
}
```

Socket.io events:

| Event | Direction | Description |
| --- | --- | --- |
| `presence:update` | Server to clients | Online/offline status |
| `typing:start` | Client to server | Typing started |
| `typing:stop` | Client to server | Typing stopped |
| `message:new` | Server to recipient | New message |
| `message:sent` | Server to sender | Sent message confirmation |
| `message:seen` | Server to sender | Seen status update |

## Notifications

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | Yes | List notifications and unread count |
| PATCH | `/notifications/read-all` | Yes | Mark all read |
| PATCH | `/notifications/:notificationId/read` | Yes | Mark one read |

## Reports

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| GET | `/reports` | Yes | Current user's reports |
| GET | `/reports/:reportId` | Yes | Single report created by current user |
| POST | `/reports` | Yes | Report post, reel, story, comment, user, or message |

Report body:

```json
{
  "targetType": "Post",
  "targetId": "POST_ID",
  "reason": "spam",
  "details": "Repeated promotional content."
}
```

## Uploads

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| POST | `/uploads` | Yes | Upload image/video to Cloudinary with multipart field `media` |

## Admin

| Method | Endpoint | Protected | Description |
| --- | --- | --- | --- |
| POST | `/admin/login` | No | Admin login |
| GET | `/admin/dashboard` | Admin | Dashboard counters |
| GET | `/admin/users` | Admin | View all users |
| PATCH | `/admin/users/:userId/block` | Admin | Block/unblock user |
| GET | `/admin/reports` | Admin | View reports |
| PATCH | `/admin/reports/:reportId` | Admin | Update report status/note |
| DELETE | `/admin/posts/:postId` | Admin | Delete reported post |

Admin login uses a user with `role: "admin"` in MongoDB.
