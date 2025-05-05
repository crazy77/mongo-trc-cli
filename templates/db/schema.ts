import { z } from 'zod'
import { extendZod, zId, zUUID } from '@zodyac/zod-mongoose'

extendZod(z)

// Example User Schema
export const user = z.object({
  _id: zId('User'),
  name: z.string().min(3).max(255),
  email: z.string().email().optional(),
  age: z.number().min(18).max(100).optional(),
  active: z.boolean().default(false),
  access: z.enum(['admin', 'user']).default('user'),
  companyId: zId('Company').optional(),
  wearable: zUUID().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.enum(['CA', 'NY', 'TX']).optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Example Post Schema
export const post = z.object({
  _id: zId('Post'),
  name: z.string(),
  content: z.string().optional(),
  user: zId('User').optional(),
  published: z.boolean().default(false).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// --- Add your Zod schemas below ---
