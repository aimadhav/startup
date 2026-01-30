import { Model } from '@nozbe/watermelondb'
import { text, date, children, json } from '@nozbe/watermelondb/decorators'

const sanitizeMetadata = (rawMetadata: unknown) => {
  return typeof rawMetadata === 'object' && rawMetadata !== null ? rawMetadata : {}
}

export default class Deck extends Model {
  static table = 'decks'
  static associations = {
    cards: { type: 'has_many', foreignKey: 'deck_id' },
  } as const

  @text('title') title!: string
  @text('subject') subject!: string
  @text('category') category!: string
  @json('metadata', sanitizeMetadata) metadata!: Record<string, any>
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  @children('cards') cards!: any
}
