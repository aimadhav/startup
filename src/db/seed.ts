import { database } from './index'
import Deck from './models/Deck'
import Card from './models/Card'
import DeckCard from './models/DeckCard'
import FsrsLog from './models/FsrsLog'

export async function resetDatabase() {
  await database.write(async () => {
    // Completely wipe the database, including WatermelonDB internal tables (sync state)
    // This is crucial to reset 'lastPulledAt' so that Sync fetches everything again.
    await database.unsafeResetDatabase()
    console.log('Database completely reset.')
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
      deck._raw.id = 'seed_deck_gk' // Fixed ID to prevent duplicates on reset
      deck.title = 'General Knowledge'
      deck.subject = 'General'
      deck.category = 'Trivia'
      deck.metadata = { description: 'A starter deck' }
      deck.createdAt = new Date()
      deck.updatedAt = new Date()
    })

    const createCard = async (id: string, front: string, back: string, tags: string[] = []) => {
      const newCard = await database.get<Card>('cards').create(card => {
        card._raw.id = id // Fixed ID
        card.deckId = defaultDeck.id
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
        card.isBookmarked = false
      })

      // Create M2M link
      await database.get<DeckCard>('deck_cards').create(link => {
        link.deck.set(defaultDeck)
        link.card.set(newCard)
      })
    }

    // 2. Create Sample Cards
    // Card 1: Standard
    await createCard('seed_card_1', 'What is the capital of France?', 'Paris', ['geography', 'easy'])

    // Card 2: Harder
    await createCard('seed_card_2', 'What is the powerhouse of the cell?', 'Mitochondria', ['biology', 'medium'])

    // Card 3: Math (Formula)
    await createCard('seed_card_3', 'Area of a circle?', '\\pi r^2', ['math', 'formula'])

    console.log('Database seeded successfully!')
  })
}
