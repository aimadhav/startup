import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'minor_cramit_db',
  jsi: true, 
  onSetUpError: error => {
    console.error('Database failed to load', error)
  }
})

export const database = new Database({
  adapter,
  modelClasses: [],
})
