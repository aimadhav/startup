import { Model } from '@nozbe/watermelondb'
import { text, date, relation, children, json } from '@nozbe/watermelondb/decorators'
import Deck from './Deck'

const sanitizeContent = (rawContent: unknown) => {
  if (typeof rawContent === 'object' && rawContent !== null) {
      return rawContent
  }
  return { front: '', back: '' }
}

const sanitizeTags = (rawTags: unknown) => {
  return Array.isArray(rawTags) ? rawTags : []
}

export default class Card extends Model {
  static table = 'cards'
  static associations = {
    decks: { type: 'belongs_to', key: 'deck_id' },
    fsrs_logs: { type: 'has_many', foreignKey: 'card_id' },
  } as const

  @text('deck_id') deckId!: string
  @text('parent_id') parentId!: string | null
  @json('content', sanitizeContent) content!: { front: string; back: string; [key: string]: any }
  @json('tags', sanitizeTags) tags!: string[]
  @text('card_type') cardType!: 'standard' | 'super_parent' | 'super_child'
  @date('created_at') createdAt!: Date

  @relation('decks', 'deck_id') deck!: any
  @children('fsrs_logs') fsrsLogs!: any
}
