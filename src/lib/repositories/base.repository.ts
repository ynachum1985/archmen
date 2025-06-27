import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database'

export type Tables = Database['public']['Tables']
export type TableName = keyof Tables

export interface IBaseRepository<T, TInsert, TUpdate> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: TInsert): Promise<T>
  update(id: string, data: TUpdate): Promise<T>
  delete(id: string): Promise<void>
}

export abstract class BaseRepository<
  TName extends TableName,
  T = Tables[TName]['Row'],
  TInsert = Tables[TName]['Insert'],
  TUpdate = Tables[TName]['Update']
> implements IBaseRepository<T, TInsert, TUpdate> {
  protected client: SupabaseClient<Database>
  protected tableName: TName

  constructor(client: SupabaseClient<Database>, tableName: TName) {
    this.client = client
    this.tableName = tableName
  }

  async findAll(): Promise<T[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')

    if (error) throw error
    return data as T[]
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('id' as any, id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as T | null
  }

  async create(data: TInsert): Promise<T> {
    const { data: created, error } = await this.client
      .from(this.tableName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(data as any)
      .select()
      .single()

    if (error) throw error
    return created as T
  }

  async update(id: string, data: TUpdate): Promise<T> {
    const { data: updated, error } = await this.client
      .from(this.tableName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(data as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('id' as any, id)
      .select()
      .single()

    if (error) throw error
    return updated as T
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('id' as any, id)

    if (error) throw error
  }
} 