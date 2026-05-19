require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./socket');

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Add it to backend/.env.');
  }

  await connectDB();

  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, () => {
      server.off('error', reject);
      console.log(`Snap Talk API running on port ${PORT}`);
      resolve();
    });
  });
};

start().catch((error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the running backend process or choose another PORT.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});
