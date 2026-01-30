import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'
import Deck from './models/Deck'
import Card from './models/Card'
import FsrsLog from './models/FsrsLog'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'minor_cramit_db_v2',
  jsi: true, 
  onSetUpError: error => {
    console.error('Database failed to load', error)
  }
})

export const database = new Database({
  adapter,
  modelClasses: [Deck, Card, FsrsLog],
})
