const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./socket');

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Add it to backend/.env.');
  }

  await connectDB();

  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Snap Talk API running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
