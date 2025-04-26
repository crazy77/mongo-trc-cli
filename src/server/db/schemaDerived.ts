import { zodSchema } from '@zodyac/zod-mongoose'
import type { SchemaOptions } from 'mongoose'
import { z } from 'zod'
import { dbInstance } from './connection' // Adjusted import path
import { user, post } from './schema'; // Adjusted import path

const sharedOptions: SchemaOptions = {
  timestamps: true,
  toJSON: { flattenObjectIds: true },
  toObject: { flattenObjectIds: true },
}

// Define collections using the mongoose instance and imported schemas
// This section will be updated by the 'generate' command
export const collections = {
  user: dbInstance.model('User', zodSchema(user, sharedOptions)),
  post: dbInstance.model('Post', zodSchema(post, sharedOptions)),
// Add other models here automatically via 'generate' command

}

// --- Generated Types and Schemas (will be updated by 'generate') ---

export type User = z.infer<typeof user>;
export const UserCreateSchema = user.omit({ _id: true, createdAt: true, updatedAt: true });
export const UserUpdateSchema = user.partial().omit({ _id: true, createdAt: true, updatedAt: true });

export type Post = z.infer<typeof post>;
export const PostCreateSchema = post.omit({ _id: true, createdAt: true, updatedAt: true });
export const PostUpdateSchema = post.partial().omit({ _id: true, createdAt: true, updatedAt: true });

// --- Utility Types (optional, adjust as needed) ---

type PopulateData = {
  post: Post;
  user: User;
// Add relations for population here

}

// Helper type for populated fields. Usage: Populated<Post, 'author'>
export type Populated<T, K extends keyof PopulateData> = T & {
  [P in K]: PopulateData[P]
}

// Common schemas for API query parameters (example)
export const getManySchema = z.object({
  limit: z.coerce.number().int().positive().default(10),
  skip: z.coerce.number().int().nonnegative().default(0),
  sort: z.enum(['asc', 'desc']).default('desc'),
  sortBy: z.string().default('_id'),
  populate: z.array(z.string()).optional(), // Handled separately usually
  select: z.array(z.string()).optional(), // Handled separately usually
  where: z.record(z.any()).optional(), // Filter needs specific schema per model
  cursor: z.string().optional(), // For cursor-based pagination
})

export const getOneSchema = z.object({
  _id: z.string(), // Usually expects a string ID from API request
  populate: z.array(z.string()).optional(),
  select: z.array(z.string()).optional(),
})

export const deleteSchema = z.object({
  _id: z.string(),
})
