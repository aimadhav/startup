import { Q } from '@nozbe/watermelondb'
import { database } from '../db'
import Card from '../db/models/Card'

export interface QueueItem {
  card: Card
  isGhost: boolean
}

export const generateSessionQueue = async (limit: number = 20, deckIds: string[] = []): Promise<QueueItem[]> => {
  const cardsCollection = database.get<Card>('cards')
  const now = Date.now()

  const conditions: any[] = [
    Q.or(
      Q.where('state', 0), // New
      Q.and(
        Q.where('state', 2), // Review
        Q.where('due', Q.lte(now)) // Due <= Now
      )
    )
  ]

  if (deckIds && deckIds.length > 0) {
    conditions.push(
      Q.on('deck_cards', Q.where('deck_id', Q.oneOf(deckIds)))
    )
  }

  // 1. Fetch due cards (State=Review & Due<=Now) OR State=New
  // complex OR queries: Q.or(...)
  const dueCards = await cardsCollection.query(
    ...conditions,
    Q.take(limit)
  ).fetch()

  // Strict filtering (double-check query results, especially for OR logic)
  const validDueCards = dueCards.filter(c => {
    return c.state === 0 || (c.state === 2 && c.due.getTime() <= now)
  })

  // 2. Identify super_child cards
  const superChildren = validDueCards.filter(c => c.cardType === 'super_child' && c.parentId)
  const parentIds = [...new Set(superChildren.map(c => c.parentId!))]

  // 3. Fetch corresponding super_parent cards
  let parents: Card[] = []
  if (parentIds.length > 0) {
    parents = await cardsCollection.query(
      Q.where('id', Q.oneOf(parentIds))
    ).fetch()
  }

  const parentMap = new Map(parents.map(p => [p.id, p]))

  // 4. Interleave parents before their children
  const queue: QueueItem[] = []
  const processedParents = new Set<string>()

  for (const card of validDueCards) {
    if (card.cardType === 'super_child' && card.parentId) {
      const parent = parentMap.get(card.parentId)
      // If we found the parent and haven't added it yet in this session
      if (parent && !processedParents.has(parent.id)) {
        queue.push({ card: parent, isGhost: true })
        processedParents.add(parent.id)
      }
    }
    
    // Add the card itself (not a ghost)
    queue.push({ card, isGhost: false })
  }

  return queue
}
