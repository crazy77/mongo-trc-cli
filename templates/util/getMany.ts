import type { Model, Document, FilterQuery } from 'mongoose'
import type { z } from 'zod'
// Adjust import path relative to the default location (src/server/api/util)
import { getManySchema } from '../db/schemaDerived.js'

type GetManyResult<T> = {
  data: T[]
  lastCursor: string | null
  total: number
  hasMore: boolean
}

export const getMany = async <T>(model: Model<T>, input: z.infer<typeof getManySchema>): Promise<GetManyResult<T>> => {
  const { limit, skip, sort, sortBy, populate, select, where, cursor } = input
  const baseQueryConditions = where ?? {}

  const query = model
    .find()
    .select(select ?? [])
    .limit(limit)
    .skip(skip)
    .populate(populate ?? [])
    .sort({ [sortBy]: sort === 'asc' ? 1 : -1 })

  let currentQueryConditions: FilterQuery<T> = { ...baseQueryConditions } as FilterQuery<T>
  if (cursor) {
    // Assuming cursor is the value of the sortBy field from the last item
    // This basic implementation might need adjustments based on actual cursor usage
    const cursorValueCondition = { [sortBy]: sort === 'desc' ? { $lt: cursor } : { $gt: cursor } } as FilterQuery<T>
    currentQueryConditions = { ...baseQueryConditions, ...cursorValueCondition }
  }

  query.where(currentQueryConditions)

  const data = (await query.lean().exec()) as T[] // Added lean() and type assertion

  const lastItem = data[data.length - 1] as Document | undefined
  const lastItemId = lastItem?._id?.toString() ?? null
  const lastItemSortFieldValue = lastItem ? (lastItem as any)[sortBy] : null

  let hasMore = false
  if (lastItemSortFieldValue !== null && data.length > 0 && data.length === limit) {
    const hasMoreQueryConditions: FilterQuery<T> = {
      ...baseQueryConditions,
      [sortBy]: sort === 'desc' ? { $lt: lastItemSortFieldValue } : { $gt: lastItemSortFieldValue },
    } as FilterQuery<T>
    hasMore = (await model.findOne(hasMoreQueryConditions).select({ _id: 1 }).lean()) !== null
  }

  const total = await model.countDocuments(baseQueryConditions as FilterQuery<T>)

  return {
    data,
    lastCursor: lastItemId, // Or use lastItemSortFieldValue depending on cursor strategy
    total,
    hasMore,
  }
}
