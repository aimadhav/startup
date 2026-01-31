import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from '../db'
import { supabase } from '../lib/supabase'

// RLS is currently disabled pending Auth implementation.
// Once Auth is enabled, ensure policies allow appropriate access based on user_id.

export async function sync() {
  await synchronize({
    database,
    sendCreatedAsUpdated: true, // Tells WatermelonDB to treat unknown records in 'updated' as new inserts
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const { changes, timestamp } = await pull(lastPulledAt || null)
      return { changes, timestamp }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await push(changes)
    },
    // migrationsEnabledAtVersion: 1,
  })
}

export async function pull(lastPulledAt: number | null) {
  const timestamp = Date.now()
  
  const tables = ['decks', 'cards', 'users', 'fsrs_logs']
  const changes: any = {}

  await Promise.all(
    tables.map(async (table) => {
      // PAGE_SIZE for pulling records to avoid timeouts
      const PAGE_SIZE = 1000
      let query = supabase.from(table).select('*').limit(PAGE_SIZE)
      
      if (lastPulledAt) {
        query = query.gt('updated_at', lastPulledAt)
      }

      // TODO: Implement recursive pagination for > 1000 records
      const { data, error } = await query

      if (error) {
        console.error(`Pull failed for ${table}:`, error)
        throw new Error(`Pull failed for ${table}: ${error.message}`)
      }
      
      changes[table] = {
        created: [],
        updated: [],
        deleted: [],
      }

      data?.forEach((record: any) => {
        // Map Supabase 'deleted' boolean to WatermelonDB format
        if (record.deleted) {
          changes[table].deleted.push(record.id)
        } else {
          // Convert ISO timestamps/BigInt strings to numbers for WatermelonDB
          const wmRecord = { ...record }
          
          // Safe conversion helper
          const toTimestamp = (val: any) => {
            if (!val) return null;
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
               // Check if it's a number string
               if (/^\d+$/.test(val)) return parseInt(val, 10);
               // Try date parsing
               return new Date(val).getTime();
            }
            return null;
          }

          if (wmRecord.created_at) wmRecord.created_at = toTimestamp(wmRecord.created_at)
          if (wmRecord.updated_at) wmRecord.updated_at = toTimestamp(wmRecord.updated_at)
          
          changes[table].updated.push(wmRecord)
        }
      })
    })
  )

  return { changes, timestamp }
}

export async function push(changes: any) {
  const tables = ['decks', 'cards', 'users', 'fsrs_logs']

  await Promise.all(
    tables.map(async (table) => {
      const tableChanges = changes[table]
      if (!tableChanges) return

      const { created, updated, deleted } = tableChanges

      // Handle Created & Updated (Upsert)
      const recordsToUpsert = [...created, ...updated].map((record: any) => {
        // Prepare for Supabase (convert timestamps back to ISO)
        // Remove WatermelonDB internal fields (_status, _changed)
        const { _status, _changed, ...rest } = record
        const supabaseRecord = { ...rest }
        
        // Ensure updated_at is set
        const now = Date.now()
        
        // Supabase schema uses bigint for timestamps, so we pass numbers directly.
        if (!supabaseRecord.updated_at) {
             supabaseRecord.updated_at = now
        }
        
        // Inject user_id if authenticated (Placeholder: supabase.auth.getUser() needed here)
        // const { data: { user } } = await supabase.auth.getUser()
        // if (user) supabaseRecord.user_id = user.id

        return supabaseRecord
      })

      if (recordsToUpsert.length > 0) {
        const { error } = await supabase.from(table).upsert(recordsToUpsert)
        if (error) throw new Error(`Push upsert failed for ${table}: ${error.message}`)
      }

      // Handle Deleted (Soft Delete)
      if (deleted.length > 0) {
        const { error } = await supabase
          .from(table)
          .update({ deleted: true, updated_at: Date.now() })
          .in('id', deleted)
        
        if (error) throw new Error(`Push delete failed for ${table}: ${error.message}`)
      }
    })
  )
}
