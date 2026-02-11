import { create } from 'zustand'
import { FSRS, Rating, Card as FsrsCard, createEmptyCard } from 'ts-fsrs'
import { database } from '../db'
import Card from '../db/models/Card'
import FsrsLog from '../db/models/FsrsLog'
import { generateSessionQueue, QueueItem } from '../lib/queue-builder'

interface SessionState {
  queue: QueueItem[]
  currentIndex: number
  currentCard: QueueItem | null
  
  startSession: () => Promise<void>
  swipeLeft: () => Promise<void> // Hard (2)
  swipeRight: () => Promise<void> // Easy (4)
  toggleBookmark: () => Promise<void>
}

// Helper to map DB Card to FSRS Card
const mapToFsrsCard = (card: Card): FsrsCard => {
  if (card.state === 0) {
    return createEmptyCard(card.createdAt) // Or now?
  }
  
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.lastReview 
      ? (Date.now() - card.lastReview.getTime()) / (24 * 60 * 60 * 1000) 
      : 0,
    scheduled_days: 0, // Approximation as we don't store it on Card, only Logs
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.lastReview || undefined
  } as FsrsCard
}

export const useSessionStore = create<SessionState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  currentCard: null,

  startSession: async () => {
    const queue = await generateSessionQueue(20)
    set({
      queue,
      currentIndex: 0,
      currentCard: queue.length > 0 ? queue[0] : null
    })
  },

  swipeLeft: async () => {
    const { currentCard, currentIndex, queue } = get()
    if (!currentCard) return

    // If ghost, just advance
    if (currentCard.isGhost) {
      const nextIndex = currentIndex + 1
      set({
        currentIndex: nextIndex,
        currentCard: queue[nextIndex] || null
      })
      return
    }

    // Process FSRS Rating: Hard (2)
    const card = currentCard.card
    const fsrs = new FSRS({})
    const fCard = mapToFsrsCard(card)
    const now = new Date()
    
    // Fix: If card is new, ensure due date is now or handled correctly by repeat
    // ts-fsrs repeat handles it.
    
    const schedulingCards = fsrs.repeat(fCard, now)
    const record = schedulingCards[Rating.Hard] // 2

    // Update DB
    await database.write(async () => {
      await card.update(c => {
        c.due = record.card.due
        c.stability = record.card.stability
        c.difficulty = record.card.difficulty
        c.state = record.card.state
        c.lastReview = now
        c.reps = record.card.reps
        c.lapses = record.card.lapses
        c.updatedAt = now
        c.lastRating = Rating.Hard
      })

      await database.get<FsrsLog>('fsrs_logs').create(l => {
        l.cardId = card.id
        l.rating = Rating.Hard
        l.state = record.log.state
        l.stability = record.log.stability
        l.difficulty = record.log.difficulty
        l.elapsedDays = record.log.elapsed_days
        l.scheduledDays = record.log.scheduled_days
        l.due = record.log.due
        l.review = record.log.review
        l.lastReview = fCard.last_review || now // fallback
      })
    })

    // Advance
    const nextIndex = currentIndex + 1
    set({
      currentIndex: nextIndex,
      currentCard: queue[nextIndex] || null
    })
  },

  swipeRight: async () => {
    const { currentCard, currentIndex, queue } = get()
    if (!currentCard) return

    if (currentCard.isGhost) {
      const nextIndex = currentIndex + 1
      set({
        currentIndex: nextIndex,
        currentCard: queue[nextIndex] || null
      })
      return
    }

    // Process FSRS Rating: Easy (4)
    const card = currentCard.card
    const fsrs = new FSRS({})
    const fCard = mapToFsrsCard(card)
    const now = new Date()

    const schedulingCards = fsrs.repeat(fCard, now)
    const record = schedulingCards[Rating.Easy] // 4

    await database.write(async () => {
      await card.update(c => {
        c.due = record.card.due
        c.stability = record.card.stability
        c.difficulty = record.card.difficulty
        c.state = record.card.state
        c.lastReview = now
        c.reps = record.card.reps
        c.lapses = record.card.lapses
        c.updatedAt = now
        c.lastRating = Rating.Easy
      })

      await database.get<FsrsLog>('fsrs_logs').create(l => {
        l.cardId = card.id
        l.rating = Rating.Easy
        l.state = record.log.state
        l.stability = record.log.stability
        l.difficulty = record.log.difficulty
        l.elapsedDays = record.log.elapsed_days
        l.scheduledDays = record.log.scheduled_days
        l.due = record.log.due
        l.review = record.log.review
        l.lastReview = fCard.last_review || now
      })
    })

    const nextIndex = currentIndex + 1
    set({
      currentIndex: nextIndex,
      currentCard: queue[nextIndex] || null
    })
  },

  toggleBookmark: async () => {
    const { currentCard } = get()
    if (!currentCard || currentCard.isGhost) return

    const card = currentCard.card
    await database.write(async () => {
      await card.update(c => {
        c.isBookmarked = !c.isBookmarked
        c.updatedAt = new Date()
      })
    })
  }
}))
