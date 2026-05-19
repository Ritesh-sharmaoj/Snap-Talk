# Snap Talk Public Deployment

Use this when the APK should work from any Wi-Fi/mobile network. A phone cannot reach your laptop's `localhost` or private LAN IP once it leaves the same network, so the backend must be deployed to a public HTTPS URL.

## 1. Create A Public Database

Use MongoDB Atlas for production:

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Allow network access for your backend host. For simple Render/Railway testing you can allow `0.0.0.0/0`, but use a strong password.
4. Copy the connection string and set the database name to `snap-talk`.

Example:

```text
mongodb+srv://snapuser:<password>@cluster0.xxxxx.mongodb.net/snap-talk?retryWrites=true&w=majority
```

## 2. Deploy The Backend

Render, Railway, Fly.io, or any Node host will work. For Render:

1. Push this repo to GitHub.
2. Create a new Render Web Service from the repo.
3. Set Root Directory to `backend`.
4. Set Build Command to `npm install`.
5. Set Start Command to `npm start`.
6. Add these environment variables:

```text
NODE_ENV=production
TRUST_PROXY=true
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

After deploy, open:

```text
https://your-backend-host/api/health
```

It should return:

```json
{"success":true,"name":"Snap Talk API","status":"ok"}
```

## 3. Point The APK To The Public Backend

In `frontend/eas.json`, replace the placeholder values in the `production-apk` profile:

```json
"EXPO_PUBLIC_API_URL": "https://your-backend-host/api",
"EXPO_PUBLIC_SOCKET_URL": "https://your-backend-host"
```

Then build:

```powershell
cd "D:\Social Media\frontend"
eas build --profile production-apk --platform android
```

That APK will call the public backend and can work from any network.

## Local Profiles

The current `preview` profile still points to your laptop's LAN IP. Use it only for same-Wi-Fi testing. Use `production-apk` for a public APK.
