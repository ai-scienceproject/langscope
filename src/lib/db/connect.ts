import mongoose from 'mongoose';

// Function to ensure database name is present in connection string
function ensureDatabaseName(uri: string): string {
  if (!uri) {
    return 'mongodb://localhost:27017/langscope';
  }

  // If using mongodb+srv and no database name is specified, add /langscope
  if (uri.startsWith('mongodb+srv://')) {
    // Check if database name is missing (no / before ? or just trailing /)
    const urlParts = uri.split('?');
    let baseUrl = urlParts[0];
    const queryString = urlParts.length > 1 ? '?' + urlParts.slice(1).join('?') : '';
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    
    // Check if database name is missing (no / after the host part)
    const atIndex = baseUrl.indexOf('@');
    if (atIndex !== -1) {
      const afterAt = baseUrl.substring(atIndex + 1);
      // If there's no / in the part after @, or if it ends with /, add database name
      const slashIndex = afterAt.indexOf('/');
      if (slashIndex === -1 || (slashIndex === afterAt.length - 1)) {
        const dbName = 'langscope';
        uri = baseUrl + '/' + dbName + queryString;
      }
    }
  } else if (uri.startsWith('mongodb://')) {
    // For regular mongodb://, ensure database name is present
    const urlParts = uri.split('?');
    const baseUrl = urlParts[0];
    const queryString = urlParts.length > 1 ? '?' + urlParts.slice(1).join('?') : '';
    
    if (!baseUrl.includes('/') || baseUrl.endsWith('/')) {
      const dbName = 'langscope';
      uri = baseUrl.replace(/\/$/, '') + '/' + dbName + queryString;
    }
  }

  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set. Please configure it in Azure App Service.');
  }

  // Get and process connection string dynamically (ensures database name is present)
  const MONGODB_URI = ensureDatabaseName(process.env.DATABASE_URL);

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', {
          message: error.message,
          name: error.name,
          code: (error as any).code,
          codeName: (error as any).codeName,
        });
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const error = e as Error;
    console.error('❌ Failed to connect to MongoDB:', {
      message: error.message,
      stack: error.stack,
    });
    throw e;
  }

  return cached.conn;
}

export default connectDB;

