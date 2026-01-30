import { createTestDatabase } from '../test-utils'
import { Q } from '@nozbe/watermelondb'
import { FSRS, Rating, State, createEmptyCard } from 'ts-fsrs'
import Deck from '../models/Deck'
import Card from '../models/Card'
import FsrsLog from '../models/FsrsLog'

describe('Database Core Logic', () => {
  let database: any
  
  beforeEach(() => {
    database = createTestDatabase()
  })

  test('Scenario A: Content Management', async () => {
    await database.write(async () => {
      // Create a Deck
      const deck = await database.get('decks').create((d: Deck) => {
        d.title = 'Test Deck'
        d.subject = 'General'
        d.category = 'Test'
        d.createdAt = new Date()
        d.updatedAt = new Date()
      })

      // Add 3 Cards
      const makeCard = async (q: string, a: string) => {
        await database.get('cards').create((c: Card) => {
          c.deck.set(deck)
          c.content = { front: q, back: a }
          c.cardType = 'standard'
          c.createdAt = new Date()
          c.updatedAt = new Date()
          c.state = 0 // New
          c.stability = 0
          c.difficulty = 0
          c.due = new Date()
          c.reps = 0
          c.lapses = 0
        })
      }

      await makeCard('Q1', 'A1')
      await makeCard('Q2', 'A2')
      await makeCard('Q3', 'A3')
    })

    // Verify
    const decks = await database.get('decks').query().fetch()
    expect(decks.length).toBe(1)
    
    const deck = decks[0]
    const cards = await deck.cards.fetch()
    expect(cards.length).toBe(3)
    expect(cards[0].content.front).toBeDefined()
  })

  test('Scenario B: FSRS Review Simulation & Log Integrity', async () => {
    const fsrs = new FSRS({})
    let cardId: string = ''
    const initialDate = new Date()

    // 1. Create a 'New' card
    await database.write(async () => {
       const deck = await database.get('decks').create((d: Deck) => {
        d.title = 'FSRS Deck'
        d.subject = 'FSRS'
        d.category = 'Algorithm'
        d.createdAt = initialDate
        d.updatedAt = initialDate
       })
       const card = await database.get('cards').create((c: Card) => {
         c.deck.set(deck)
         c.content = { front: 'FSRS Q', back: 'FSRS A' }
         c.cardType = 'standard'
         c.createdAt = initialDate
         c.updatedAt = initialDate
         c.state = 0 // New
         c.stability = 0
         c.difficulty = 0
         c.due = initialDate
         c.reps = 0
         c.lapses = 0
       })
       cardId = card.id
    })

    // 2. Calculate next parameters for "Good"
    // Advance time slightly to ensure timestamps differ if needed, though usually date objects are precise enough
    const reviewTime = new Date(initialDate.getTime() + 1000) 
    
    // Helper to map DB card to FSRS Card object (Simulated)
    const fCard = createEmptyCard(initialDate) // Since it's new
    
    const schedulingCards = fsrs.repeat(fCard, reviewTime)
    const goodRecord = schedulingCards[Rating.Good]

    // 3. Update Card and Create Log
    await database.write(async () => {
      const card = await database.get('cards').find(cardId)
      await card.update((c: Card) => {
        c.due = goodRecord.card.due
        c.stability = goodRecord.card.stability
        c.difficulty = goodRecord.card.difficulty
        c.state = goodRecord.card.state
        c.lastReview = goodRecord.card.last_review || reviewTime
        c.reps = goodRecord.card.reps
        c.lapses = goodRecord.card.lapses
        // Critical: Update Sync field
        c.updatedAt = reviewTime
      })

      await database.get('fsrs_logs').create((l: FsrsLog) => {
        l.card.set(card)
        l.rating = Rating.Good
        l.state = goodRecord.log.state
        l.stability = goodRecord.log.stability
        l.difficulty = goodRecord.log.difficulty
        l.elapsedDays = goodRecord.log.elapsed_days
        l.scheduledDays = goodRecord.log.scheduled_days
        l.due = goodRecord.log.due
        l.review = goodRecord.log.review
        l.lastReview = initialDate // The previous review/creation time
      })
    })

    // 4. Verify Card Updates
    const updatedCard = await database.get('cards').find(cardId)
    
    expect(updatedCard.state).toBe(goodRecord.card.state)
    expect(updatedCard.stability).toBe(goodRecord.card.stability)
    expect(updatedCard.difficulty).toBe(goodRecord.card.difficulty)
    expect(updatedCard.reps).toBe(goodRecord.card.reps)
    expect(updatedCard.lapses).toBe(goodRecord.card.lapses)
    
    // Verify Timestamps
    expect(updatedCard.due.getTime()).toBe(goodRecord.card.due.getTime())
    expect(updatedCard.lastReview?.getTime()).toBe(reviewTime.getTime())
    // Sync field verification
    expect(updatedCard.updatedAt.getTime()).toBeGreaterThan(updatedCard.createdAt.getTime())
    expect(updatedCard.updatedAt.getTime()).toBe(reviewTime.getTime())

    // 5. Verify FsrsLog Completeness
    const logs = await updatedCard.fsrsLogs.fetch()
    expect(logs.length).toBe(1)
    const log = logs[0]

    expect(log.rating).toBe(Rating.Good)
    expect(log.state).toBe(goodRecord.log.state)
    expect(log.stability).toBe(goodRecord.log.stability)
    expect(log.difficulty).toBe(goodRecord.log.difficulty)
    expect(log.elapsedDays).toBe(goodRecord.log.elapsed_days)
    expect(log.scheduledDays).toBe(goodRecord.log.scheduled_days)
    expect(log.due.getTime()).toBe(goodRecord.log.due.getTime())
    expect(log.review.getTime()).toBe(goodRecord.log.review.getTime())
  })

  test('Scenario C: Priority Querying', async () => {
    // Seed DB
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    await database.write(async () => {
      const deck = await database.get('decks').create((d: Deck) => { 
          d.title = 'Priority Deck' 
          d.subject = 'P'
          d.category = 'P'
          d.createdAt = new Date()
          d.updatedAt = new Date()
      })

      // Card 1: Due Yesterday (Review, state=2)
      await database.get('cards').create((c: Card) => {
        c.deck.set(deck)
        c.state = State.Review
        c.due = new Date(now - oneDay) // Yesterday
        c.cardType = 'standard'
        c.content = { front: 'Due', back: 'Yesterday' }
        c.createdAt = new Date()
        c.updatedAt = new Date()
        c.stability = 0
        c.difficulty = 0
        c.reps = 0
        c.lapses = 0
      })

      // Card 2: Due Tomorrow (Review, state=2)
      await database.get('cards').create((c: Card) => {
        c.deck.set(deck)
        c.state = State.Review
        c.due = new Date(now + oneDay) // Tomorrow
        c.cardType = 'standard'
        c.content = { front: 'Due', back: 'Tomorrow' }
        c.createdAt = new Date()
        c.updatedAt = new Date()
        c.stability = 0
        c.difficulty = 0
        c.reps = 0
        c.lapses = 0
      })

      // Card 3: New (state=0)
      await database.get('cards').create((c: Card) => {
        c.deck.set(deck)
        c.state = State.New
        c.due = new Date(now)
        c.cardType = 'standard'
        c.content = { front: 'New', back: 'Card' }
        c.createdAt = new Date()
        c.updatedAt = new Date()
        c.stability = 0
        c.difficulty = 0
        c.reps = 0
        c.lapses = 0
      })
    })

    // Query: State = Review AND Due <= Now
    const results = await database.get('cards').query(
        Q.and(
            Q.where('state', State.Review),
            Q.where('due', Q.lte(now))
        )
    ).fetch()

    expect(results.length).toBe(1)
    expect(results[0].content.front).toBe('Due')
    expect(results[0].due.getTime()).toBeLessThan(now)
  })

  test('Scenario D: Sync Field (updatedAt) Behavior', async () => {
    let deckId = ''
    const t0 = new Date()
    
    // 1. Create
    await database.write(async () => {
      const deck = await database.get('decks').create((d: Deck) => {
        d.title = 'Sync Test'
        d.createdAt = t0
        d.updatedAt = t0
      })
      deckId = deck.id
    })

    const deckV1 = await database.get('decks').find(deckId)
    const initialUpdatedAt = deckV1.updatedAt.getTime()
    expect(initialUpdatedAt).toBe(t0.getTime())

    // 2. Update (Simulate application update logic)
    const t1 = new Date(t0.getTime() + 5000)
    await database.write(async () => {
      const deck = await database.get('decks').find(deckId)
      await deck.update((d: Deck) => {
        d.title = 'Sync Test Updated'
        d.updatedAt = t1 // Application must explicitly set this, ensuring it works
      })
    })

    // 3. Verify
    const deckV2 = await database.get('decks').find(deckId)
    expect(deckV2.title).toBe('Sync Test Updated')
    expect(deckV2.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt)
    expect(deckV2.updatedAt.getTime()).toBe(t1.getTime())
    
    // Verify createdAt remained unchanged
    expect(deckV2.createdAt.getTime()).toBe(t0.getTime())
  })
})
