# Snap Talk

Snap Talk is a full-stack, Instagram-inspired but original social media mobile app built with Expo, Node.js, Express, MongoDB, JWT auth, Cloudinary media uploads, and Socket.io real-time messaging.

The UI uses a unique Snap Talk palette: ink, mint, coral, saffron, and paper tones. It includes auth, profile setup, feed, stories, reels, explore, post creation, messaging, notifications, settings, and an admin dashboard.

## Tech Stack

- Mobile frontend: React Native with Expo SDK 55
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT with bcrypt password hashing
- Media upload: Cloudinary
- Real-time: Socket.io
- Mobile navigation: React Navigation

Expo SDK 55 was chosen from the official Expo SDK release list and changelog because it is the current stable SDK shown for 2026 and includes React Native 0.83 / React 19.2.

Sources:
- https://expo.dev/sdk
- https://expo.dev/changelog/sdk-55

## Folder Structure

```text
Snap Talk/
  backend/
    .env.example
    package.json
    src/
      app.js
      server.js
      config/
      controllers/
      middleware/
      models/
      routes/
      socket/
      utils/
  frontend/
    .env.example
    App.js
    app.json
    babel.config.js
    package.json
    src/
      api/
      components/
      context/
      data/
      navigation/
      screens/
      services/
      theme/
      utils/
  docs/
    API.md
    README.md
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Update `backend/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:8081
MONGODB_URI=mongodb://127.0.0.1:27017/snap-talk
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Backend runs at:

```text
http://localhost:5000
```

Health check:

```text
GET /api/health
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Update `frontend/.env` if your backend is not local:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

Run options:

```bash
npm start
npm run android
npm run ios
npm run web
```

On a physical phone, replace `localhost` with your computer's LAN IP address in `frontend/.env`.

## Build Android APK

Registration is the first auth screen after splash. To generate an installable Android APK with Expo EAS:

```bash
cd frontend
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

When EAS finishes, it gives you an APK download link. For a phone on the same Wi-Fi as your backend, set `EXPO_PUBLIC_API_URL` in `frontend/.env` to your computer LAN IP before building, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:5000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.50:5000
```

## Implemented Screens

- Splash
- Login
- Signup
- Forgot Password
- Profile Setup
- Home Feed
- Search / Explore
- Create Post
- Reels
- Notifications
- Chat List
- Chat
- Profile
- Edit Profile
- Settings
- Story Viewer
- Admin Dashboard

## Backend API Groups

Detailed API docs are in [docs/API.md](docs/API.md).

- `auth`: signup, login, forgot/reset password, profile setup, change password
- `users`: search, profile, update profile, followers, following, delete account
- `posts`: feed, explore, create, save, share, delete, hashtag search
- `stories`: create, active stories, view, viewers, delete
- `reels`: create, vertical feed, share, delete
- `comments`: add, list, delete
- `likes`: like/unlike posts, reels, comments
- `follow`: follow/unfollow users
- `messages`: conversations, chat thread, send, seen status
- `notifications`: list, mark read
- `reports`: create and view reports
- `admin`: admin login, dashboard, users, block/unblock, reports, delete posts
- `uploads`: Cloudinary media upload

## Notes

- The mobile app includes demo data and a "Preview demo app" login path so the UI can be explored before MongoDB and Cloudinary are configured.
- Real API calls are already wired for authenticated users.
- Push notifications are represented with a ready structure in settings and backend notifications; adding Expo push tokens is the next production step.
- Cloudinary uploads require Cloudinary env keys. Without them, you can still create posts by sending a direct `mediaUrl` to the API.
