# Snap Talk

Snap Talk is a full-stack, Instagram-inspired social media mobile app built with **Expo**, **Node.js**, **Express**, **MongoDB**, **JWT auth**, **Cloudinary** media uploads, and **Socket.io** real-time messaging.

The UI uses a unique Snap Talk palette: ink, mint, coral, saffron, and paper tones. Features include authentication, profile setup, feed, stories, reels, explore, post creation, messaging, notifications, settings, and an admin dashboard.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
- [Expo Go](https://expo.dev/expo-go) app on your physical device (optional)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MONGODB_URI and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your computer's LAN IP if using a physical device
npm start
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Port for the backend server | `5000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `CLIENT_URL` | URL of the frontend (for CORS) | `http://localhost:8081` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/snap-talk` |
| `JWT_SECRET` | Secret key for JWT signing | `replace_with_a_long_random_secret` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | - |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Base URL for the Backend API | `http://localhost:5000/api` |
| `EXPO_PUBLIC_SOCKET_URL` | Base URL for the Socket.io server | `http://localhost:5000` |

> **Note:** When testing on a physical device, replace `localhost` with your computer's local IP address (e.g., `192.168.1.50`).

---

## 🛤️ API Documentation

The backend API is structured into several groups.

### Interactive Swagger Docs
Access the interactive API documentation at:
**[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

#### How to use Bearer Authentication in Swagger:
1.  **Login or Signup**: Use the `/auth/login` or `/auth/signup` endpoints to get an `accessToken`.
2.  **Authorize**: Click the **Authorize** (lock icon) button at the top of the Swagger page.
3.  **Enter Token**: Paste your token in the value field as `Bearer <your_token_here>`.
4.  **Test**: Now you can execute protected requests.

Detailed static documentation can also be found in [docs/API.md](docs/API.md).

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user (Protected)

### Social Features
- `GET /api/posts/feed` - Get home feed
- `POST /api/posts` - Create a new post
- `POST /api/stories` - Create a 24-hour story
- `GET /api/reels` - Vertical video feed
- `POST /api/follow/:userId` - Follow/unfollow users

### Messaging
- `GET /api/messages/conversations` - List all chats
- `GET /api/messages/:userId` - Get chat history
- `POST /api/messages` - Send a message

---

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo SDK 55
- **Backend**: Node.js & Express
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Media**: Cloudinary
- **Auth**: JWT with bcrypt

---

## 📁 Project Structure

```text
Snap Talk/
├── backend/          # Node.js Express API
│   ├── src/          # Source code
│   └── .env.example  # Backend environment template
├── frontend/         # React Native Expo app
│   ├── src/          # Source code
│   └── .env.example  # Frontend environment template
├── docs/             # Detailed documentation
└── postman/          # Postman collections for testing
```

---

## 📱 Running the App

### Backend
Run in development mode with auto-reload:
```bash
cd backend
npm run dev
```

### Frontend
Start the Expo development server:
```bash
cd frontend
npm start
```
From the Expo Dev Tools, you can:
- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Press `w` for Web
- Scan the QR code with **Expo Go** on your physical phone.

---

## 🏗️ Build

To generate an installable Android APK with Expo EAS:
```bash
cd frontend
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

### APK That Works From Any Network

The `preview` APK profile uses your laptop's LAN IP, so it only works on the same Wi-Fi. For an APK that works anywhere, deploy the backend to a public HTTPS host, set the public URL in `frontend/eas.json` under `production-apk`, then build:

```bash
cd frontend
eas build -p android --profile production-apk
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full MongoDB Atlas + public backend setup.
