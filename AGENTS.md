# Repository Guidelines

## Project Structure & Module Organization
This is a full-stack social media application ("Snap Talk") divided into two main components:
- **`.\backend`**: A Node.js/Express server using MongoDB (Mongoose) for data storage, Socket.io for real-time communication, and Swagger for API documentation. It follows a traditional MVC-like structure with `controllers`, `models`, `routes`, and `middleware`.
- **`.\frontend`**: A React Native application built with Expo. It uses React Navigation for routing, Context API for authentication state (`.\frontend\src\context\AuthContext.js`), and Axios for API interaction (`.\frontend\src\api\client.js`).

## Build, Test, and Development Commands
### Backend (`.\backend`)
- **Install**: `npm install`
- **Development**: `npm run dev` (uses nodemon)
- **Start**: `npm start`
- **Lint/Test**: `npm run lint` or `npm run test` (currently runs `node --check src/server.js`)

### Frontend (`.\frontend`)
- **Install**: `npm install`
- **Start**: `npm start` (Expo CLI)
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`
- **Lint**: `npm run lint` (uses `eslint`)

## Coding Style & Naming Conventions
- **Backend**: Uses CommonJS modules (`require`/`module.exports`). Controllers handle logic, and routes define endpoints.
- **Frontend**: Uses ES Modules (`import`/`export`). Functional components with hooks are preferred. Styles are typically managed via `react-native`'s `StyleSheet`.
- **Naming**: Follow standard camelCase for variables and functions, PascalCase for components and models.

## Testing Guidelines
- **Backend**: Basic syntax check via `node --check`. No formal testing framework (Jest/Mocha) is currently configured.
- **Frontend**: Linting is performed via `eslint`.

## Commit & Pull Request Guidelines
- Commits should be descriptive but concise.
- Examples from history: `Initial commit - Snap Talk app`, `Wire frontend screens to backend APIs`, `Save updated backend auth, routes, and security middleware`.
- Avoid vague messages like "Push".
