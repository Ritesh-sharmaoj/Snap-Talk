const mongoose = require('mongoose');

const localMongoUri = 'mongodb://127.0.0.1:27017/snap-talk';

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production.');
    }

    mongoUri = localMongoUri;
  }

  console.log(`Attempting to connect to MongoDB: ${mongoUri}`);

  mongoose.set('strictQuery', true);
  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (process.env.NODE_ENV !== 'production' && mongoUri !== localMongoUri) {
      console.log('Retrying with local MongoDB...');
      const connection = await mongoose.connect(localMongoUri);
      console.log(`MongoDB connected locally: ${connection.connection.host}`);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;
