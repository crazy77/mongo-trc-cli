import { Mongoose } from 'mongoose'
// import { env } from '~/env'; // Adjust this import based on your project structure

const mongooseInstance = new Mongoose()

let connectionPromise: Promise<Mongoose> | null = null

/**
 * @returns A promise that resolves with the Mongoose instance upon successful connection.
 */
export const connectDb = (): Promise<Mongoose> => {
  if (!connectionPromise) {
    console.log('Attempting to connect to MongoDB...')
    // Make sure to replace process.env.DATABASE_URL with your actual database URL
    // or use the imported 'env' variable after configuring it.
    const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/mydatabase'
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set.')
      process.exit(1)
    }

    connectionPromise = mongooseInstance
      .connect(databaseUrl, {})
      .then((instance) => {
        console.log('🔌 Successfully connected to MongoDB')
        return instance
      })
      .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err)
        // Exit the application forcefully if DB connection is critical
        process.exit(1)
      })
  }
  // Ensure the promise is returned even if it already exists
  return connectionPromise!
}

// Export the instance if direct access is needed elsewhere, though context is preferred
export const dbInstance = mongooseInstance
