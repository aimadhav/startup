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
      deck.updatedAt = new Date()
    })

    const createCard = async (front: string, back: string, tags: string[] = []) => {
      await database.get<Card>('cards').create(card => {
        card.deck.set(defaultDeck)
        card.content = { front, back }
        card.cardType = 'standard'
        card.tags = tags
        card.createdAt = new Date()
        card.updatedAt = new Date()
        
        // FSRS Defaults for New Card
        card.state = 0 // New
        card.stability = 0
        card.difficulty = 0
        card.due = new Date()
        card.reps = 0
        card.lapses = 0
      })
    }

    // 2. Create Sample Cards
    // Card 1: Standard
    await createCard('What is the capital of France?', 'Paris', ['geography', 'easy'])

    // Card 2: Harder
    await createCard('What is the powerhouse of the cell?', 'Mitochondria', ['biology', 'medium'])

    // Card 3: Math (Formula)
    await createCard('Area of a circle?', '\\pi r^2', ['math', 'formula'])

    console.log('Database seeded successfully!')
  })
}
