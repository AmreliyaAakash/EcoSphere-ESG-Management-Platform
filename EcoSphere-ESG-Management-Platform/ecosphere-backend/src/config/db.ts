import mongoose from 'mongoose';
import { env } from './env';

// Configure global JSON options for Mongoose serialization
mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    const r = ret as any;
    if (r._id) {
      r.id = r._id.toString();
    }
    delete r._id;
    delete r.__v;
    return r;
  }
});

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
