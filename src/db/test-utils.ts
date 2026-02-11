import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import schema from './schema'
import Deck from './models/Deck'
import Card from './models/Card'
import DeckCard from './models/DeckCard'
import FsrsLog from './models/FsrsLog'
import User from './models/User'

export const createTestDatabase = () => {
  const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: false,
  })

  const database = new Database({
    adapter,
    modelClasses: [Deck, Card, DeckCard, FsrsLog, User],
  })

  return database
}
