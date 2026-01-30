import { database } from './index'
import Deck from './models/Deck'
import Card from './models/Card'
import FsrsLog from './models/FsrsLog'

export async function resetDatabase() {
  await database.write(async () => {
    // Delete all records in reverse order of dependency
    const logs = await database.get<FsrsLog>('fsrs_logs').query().fetch()
    const cards = await database.get<Card>('cards').query().fetch()
    const decks = await database.get<Deck>('decks').query().fetch()

    // Batch delete
    const logsToDelete = logs.map(log => log.prepareDestroyPermanently())
    const cardsToDelete = cards.map(card => card.prepareDestroyPermanently())
    const decksToDelete = decks.map(deck => deck.prepareDestroyPermanently())

    await database.batch(...logsToDelete, ...cardsToDelete, ...decksToDelete)
    console.log('Database cleared.')
  })
}

export async function seedDatabase() {
  await database.write(async () => {
    const decksCount = await database.get<Deck>('decks').query().fetchCount()
    
    if (decksCount > 0) {
      console.log('Database already seeded.')
      return
    }

    console.log('Seeding database...')

    // 1. Create Default Deck
    const defaultDeck = await database.get<Deck>('decks').create(deck => {
      deck.title = 'General Knowledge'
      deck.subject = 'General'
      deck.category = 'Trivia'
      deck.metadata = { description: 'A starter deck' }
      deck.createdAt = new Date()
    })

    // 2. Create Sample Cards
    // Card 1: Standard
    await database.get<Card>('cards').create(card => {
      card.deck.set(defaultDeck)
      card.content = { 
        front: 'What is the capital of France?', 
        back: 'Paris' 
      }
      card.cardType = 'standard'
      card.createdAt = new Date()
      card.tags = ['geography', 'easy']
    })

    // Card 2: Harder
    await database.get<Card>('cards').create(card => {
      card.deck.set(defaultDeck)
      card.content = { 
        front: 'What is the powerhouse of the cell?', 
        back: 'Mitochondria' 
      }
      card.cardType = 'standard'
      card.createdAt = new Date()
      card.tags = ['biology', 'medium']
    })

    // Card 3: Math (Formula)
    await database.get<Card>('cards').create(card => {
      card.deck.set(defaultDeck)
      card.content = { 
        front: 'Area of a circle?', 
        back: '\\pi r^2' 
      }
      card.cardType = 'standard'
      card.createdAt = new Date()
      card.tags = ['math', 'formula']
    })

    console.log('Database seeded successfully!')
  })
}
