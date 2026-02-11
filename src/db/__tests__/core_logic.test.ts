import { createTestDatabase } from '../test-utils'
import { Q } from '@nozbe/watermelondb'
import { FSRS, Rating, State, createEmptyCard } from 'ts-fsrs'
import Deck from '../models/Deck'
import Card from '../models/Card'
import DeckCard from '../models/DeckCard'
import FsrsLog from '../models/FsrsLog'
import User from '../models/User'

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
        const card = await database.get('cards').create((c: Card) => {
          c.deckId = deck.id
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
        
        await database.get('deck_cards').create((dc: DeckCard) => {
          dc.deck.set(deck)
          dc.card.set(card)
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
    // Fetch cards via M2M
    const deckCards = await deck.deckCards.fetch()
    expect(deckCards.length).toBe(3)
    
    // Verify first card content (need to fetch related card)
    const firstCard = await deckCards[0].card.fetch()
    expect(firstCard.content.front).toBeDefined()
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
         c.deckId = deck.id
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
       await database.get('deck_cards').create((dc: DeckCard) => {
          dc.deck.set(deck)
          dc.card.set(card)
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
      const c1 = await database.get('cards').create((c: Card) => {
        c.deckId = deck.id
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
      await database.get('deck_cards').create((dc: DeckCard) => {
          dc.deck.set(deck)
          dc.card.set(c1)
      })

      // Card 2: Due Tomorrow (Review, state=2)
      const c2 = await database.get('cards').create((c: Card) => {
        c.deckId = deck.id
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
      await database.get('deck_cards').create((dc: DeckCard) => {
          dc.deck.set(deck)
          dc.card.set(c2)
      })

      // Card 3: New (state=0)
      const c3 = await database.get('cards').create((c: Card) => {
        c.deckId = deck.id
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
      await database.get('deck_cards').create((dc: DeckCard) => {
          dc.deck.set(deck)
          dc.card.set(c3)
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

  test('Scenario E: User Management & Referral Logic', async () => {
    // 1. Create User with all fields
    let userId = ''
    await database.write(async () => {
      const user = await database.get('users').create((u: User) => {
        u.name = 'Test Student'
        u.referralCode = 'REF123'
        u.teacherId = 'TEACHER_1'
        u.settings = { theme: 'dark', notifications: true }
        u.createdAt = new Date()
        u.updatedAt = new Date()
      })
      userId = user.id
    })

    // 2. Verify Initial State
    const user = await database.get('users').find(userId)
    expect(user.name).toBe('Test Student')
    expect(user.referralCode).toBe('REF123')
    expect(user.teacherId).toBe('TEACHER_1')
    expect(user.settings.theme).toBe('dark')
    expect(user.settings.notifications).toBe(true)

    // 3. Update User Settings & Name
    await database.write(async () => {
      await user.update((u: User) => {
        u.name = 'Updated Student'
        u.settings = { ...u.settings, theme: 'light' }
      })
    })

    // 4. Verify Updates
    const updatedUser = await database.get('users').find(userId)
    expect(updatedUser.name).toBe('Updated Student')
    expect(updatedUser.settings.theme).toBe('light')
    expect(updatedUser.settings.notifications).toBe(true) // Should persist
    expect(updatedUser.referralCode).toBe('REF123') // Should remain unchanged
  })

  test('Scenario F: Asset Logic & Persistence', async () => {
    let cardId = ''
    
    await database.write(async () => {
       const deck = await database.get('decks').create((d: Deck) => {
        d.title = 'Asset Deck'
        d.createdAt = new Date()
        d.updatedAt = new Date()
       })

       const card = await database.get('cards').create((c: Card) => {
         c.deckId = deck.id
         c.content = { front: 'Asset Q', back: 'Asset A' }
         c.assets = { 
           frontImage: 'file:///data/img_front.png',
           backImage: 'file:///data/img_back.png'
         }
         c.cardType = 'standard'
         c.createdAt = new Date()
         c.updatedAt = new Date()
         c.state = 0
         c.stability = 0
         c.difficulty = 0
         c.due = new Date()
         c.reps = 0
         c.lapses = 0
       })
       await database.get('deck_cards').create((dc: DeckCard) => {
          dc.deck.set(deck)
          dc.card.set(card)
       })
       cardId = card.id
    })

    const card = await database.get('cards').find(cardId)
    expect(card.assets.frontImage).toBe('file:///data/img_front.png')
    expect(card.assets.backImage).toBe('file:///data/img_back.png')
  })

  test('Scenario G: Mistakes Filter Logic (lastRating Query)', async () => {
    // This tests the logic for "Mistakes" mode where we want cards with lastRating < 3 (Again=1, Hard=2)
    
    await database.write(async () => {
      const deck = await database.get('decks').create((d: Deck) => {
        d.title = 'Mistakes Deck'
        d.createdAt = new Date()
        d.updatedAt = new Date()
      })

      // Helper to create card with specific lastRating
      const createRatedCard = async (rating: number, front: string) => {
        const card = await database.get('cards').create((c: Card) => {
          c.deckId = deck.id
          c.content = { front, back: 'Ans' }
          c.lastRating = rating
          c.cardType = 'standard'
          c.createdAt = new Date()
          c.updatedAt = new Date()
          c.state = 2 // Review
          c.stability = 0
          c.difficulty = 0
          c.due = new Date()
          c.reps = 1
          c.lapses = rating === 1 ? 1 : 0
        })
        await database.get('deck_cards').create((dc: DeckCard) => {
            dc.deck.set(deck)
            dc.card.set(card)
        })
      }

      await createRatedCard(1, 'Card Again') // Mistake
      await createRatedCard(2, 'Card Hard')  // Mistake
      await createRatedCard(3, 'Card Good')  // OK
      await createRatedCard(4, 'Card Easy')  // OK
    })

    // Query: lastRating < 3 (Again or Hard)
    // Note: In WatermelonDB/SQLite, we might need to be careful with nulls, but here we set them all.
    const mistakes = await database.get('cards').query(
      Q.where('last_rating', Q.lt(3))
    ).fetch()

    expect(mistakes.length).toBe(2)
    
    const fronts = mistakes.map((c: Card) => c.content.front).sort()
    expect(fronts).toEqual(['Card Again', 'Card Hard'])
  })
})
