import { Model } from '@nozbe/watermelondb'
import { date, immutableRelation } from '@nozbe/watermelondb/decorators'
import Card from './Card'
import Deck from './Deck'

export default class DeckCard extends Model {
  static table = 'deck_cards'
  static associations = {
    cards: { type: 'belongs_to', key: 'card_id' },
    decks: { type: 'belongs_to', key: 'deck_id' },
  } as const

  @immutableRelation('cards', 'card_id') card!: any
  @immutableRelation('decks', 'deck_id') deck!: any
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
}
