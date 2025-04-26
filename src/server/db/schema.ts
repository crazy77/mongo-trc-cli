import { z } from 'zod'
import { extendZod, zId, zUUID } from '@zodyac/zod-mongoose'

extendZod(z)

// Example User Schema
export const user = z.object({
  _id: zId('User'),
  name: z.string().min(3).max(255),
  email: z.string().email().optional(), // Added email example
  age: z.number().min(18).max(100).optional(),
  active: z.boolean().default(false),
  access: z.enum(['admin', 'user']).default('user'),
  // companyId: zId('Company').optional(), // Example relation
  // wearable: zUUID().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      // state: z.enum(['CA', 'NY', 'TX']).optional(), // Example enum
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Example Post Schema
export const post = z.object({
  _id: zId('Post'),
  title: z.string(), // Changed from 'name' to 'title'
  content: z.string().optional(), // Added content field
  author: zId('User').optional(), // Renamed from 'user' to 'author' for clarity
  published: z.boolean().default(false).optional(), // Added published field
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const admin = z.object({
  _id: zId('Admin'),
  name: z.string().min(3).max(255),
  email: z.string().email().optional(), // Added email example
  password: z.string().min(8),
  role: z.enum(['admin', 'staff']).default('staff'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})
