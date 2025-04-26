// Placeholder for API logic for User
// Typically, you would import your TRPC router or Express app instance here
// and define routes that use the imported schemas and collections.

import { z } from 'zod';
// Adjust these import paths based on your project structure
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { getMany } from '../util/getMany'; 
import {
  collections,
  deleteSchema,
  getManySchema,
  getOneSchema,
  User,
  UserCreateSchema,
  UserUpdateSchema,
} from '../../db/schemaDerived';

export const userRouter = createTRPCRouter({
  getMany: publicProcedure.input(getManySchema).query(async ({ input, ctx }) => {
    // Assuming ctx.db holds the collections object or similar DB access
    // Adjust ctx.db.user if your context structure is different
    const res = await getMany<User>(collections.user, input);
    return res;
  }),
  getOne: publicProcedure.input(getOneSchema).query(async ({ input, ctx }) => {
    const res = await collections.user
      .findOne({ _id: input._id })
      .select(input.select ?? [])
      .populate(input.populate ?? []) // Make sure populate is handled correctly
      .lean()
      .exec();
    return res;
  }),
  create: protectedProcedure.input(UserCreateSchema).mutation(async ({ input, ctx }) => {
    const res = await collections.user.create(input);
    return res;
  }),
  update: protectedProcedure.input(UserUpdateSchema.extend({ _id: z.string() })).mutation(async ({ input, ctx }) => {
    // Note: Update requires _id in input for this structure
    const { _id, ...updateData } = input;
    const res = await collections.user.findByIdAndUpdate(_id, updateData, { new: true }).lean();
    // findByIdAndUpdate returns the updated document by default with {new: true}
    return res;
  }),
  delete: protectedProcedure.input(deleteSchema).mutation(async ({ input, ctx }) => {
    const res = await collections.user.deleteOne({ _id: input._id }).exec();
    // deleteOne returns { acknowledged: boolean, deletedCount: number }
    return res;
  }),
});

// --- Example CRUD Function Stubs --- 
// Replace these with your actual API framework implementation (e.g., tRPC procedures, Express routes)

export async function getUser(id: string): Promise<User | null> {
  // const validatedId = getOneSchema.parse({ _id: id }); // Example validation
  console.log(`[API Stub] Getting user with id: ${id}`);
  // const item = await collections.user.findById(id).lean();
  // return item as User | null;
  return null; // Placeholder
}

export async function getManyUsers(query: z.infer<typeof getManySchema>): Promise<User[]> {
  // const validatedQuery = getManySchema.parse(query); // Example validation
  console.log(`[API Stub] Getting many users with query:`, query);
  // const items = await collections.user
  //   .find(/* validatedQuery.where */)
  //   .limit(validatedQuery.limit)
  //   .skip(validatedQuery.skip)
  //   .sort({ [validatedQuery.sortBy]: validatedQuery.sort })
  //   .lean();
  // return items as User[];
  return []; // Placeholder
}

export async function createUser(data: z.infer<typeof UserCreateSchema>): Promise<User> {
  // const validatedData = UserCreateSchema.parse(data); // Example validation
  console.log(`[API Stub] Creating user with data:`, data);
  // const newItem = await collections.user.create(validatedData);
  // return newItem.toObject() as User;
  throw new Error('Not implemented'); // Placeholder
}

export async function updateUser(id: string, data: z.infer<typeof UserUpdateSchema>): Promise<User | null> {
  // const validatedId = getOneSchema.parse({ _id: id }); // Example validation
  // const validatedData = UserUpdateSchema.parse(data); // Example validation
  console.log(`[API Stub] Updating user ${id} with data:`, data);
  // const updatedItem = await collections.user.findByIdAndUpdate(id, validatedData, { new: true }).lean();
  // return updatedItem as User | null;
  return null; // Placeholder
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  // const validatedId = deleteSchema.parse({ _id: id }); // Example validation
  console.log(`[API Stub] Deleting user with id: ${id}`);
  // const result = await collections.user.deleteOne({ _id: id });
  // return { success: result.deletedCount === 1 };
  return { success: false }; // Placeholder
}

// If using tRPC, you might export a router like this:
/*
import { createTRPCRouter, publicProcedure } from "../trpc"; // Adjust import

export const userRouter = createTRPCRouter({
  getOne: publicProcedure.input(getOneSchema).query(({ input }) => {
    return getUser(input._id);
  }),
  getMany: publicProcedure.input(getManySchema).query(({ input }) => {
    return getManyUsers(input);
  }),
  create: publicProcedure.input(UserCreateSchema).mutation(({ input }) => {
    return createUser(input);
  }),
  update: publicProcedure.input(UserUpdateSchema.extend({ _id: z.string() })).mutation(({ input }) => {
    const { _id, ...data } = input;
    return updateUser(_id, data);
  }),
  delete: publicProcedure.input(deleteSchema).mutation(({ input }) => {
    return deleteUser(input._id);
  }),
});
*/ 